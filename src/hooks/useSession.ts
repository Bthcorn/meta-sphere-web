import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionsApi } from '@/api/sessions.api';
import { useSessionStore } from '@/store/session.store';
import { useSpacePresenceStore } from '@/store/space-presence.store';
import { socketManager } from '@/lib/socket-manager';
import { useScreenShareStore } from '@/store/screen-share.store';
import type { CreateSessionDto } from '@/types/session';

export function useSession() {
  const qc = useQueryClient();
  const { activeSession, currentZoneConfig, setActiveSession } = useSessionStore();

  const roomId = currentZoneConfig?.roomId ?? null;
  const mode = currentZoneConfig?.mode ?? null;

  // Invalidate queries on socket events
  useEffect(() => {
    if (!activeSession) return;
    const socket = socketManager.instance;
    if (!socket) return;

    const invalidateParticipants = () =>
      qc.invalidateQueries({ queryKey: ['sessions', 'participants', activeSession.id] });
    const invalidateSessionList = () => {
      qc.invalidateQueries({ queryKey: ['sessions', 'list', roomId] });
      qc.invalidateQueries({ queryKey: ['sessions', 'single', roomId] });
    };

    socket.on('user_connected', invalidateParticipants);
    socket.on('user_disconnected', invalidateParticipants);
    socket.on('session:started', invalidateSessionList);
    socket.on('session:ended', invalidateSessionList);

    return () => {
      socket.off('user_connected', invalidateParticipants);
      socket.off('user_disconnected', invalidateParticipants);
      socket.off('session:started', invalidateSessionList);
      socket.off('session:ended', invalidateSessionList);
    };
  }, [activeSession, qc, roomId]);

  const { data: sessionList = [], isLoading: listLoading } = useQuery({
    queryKey: ['sessions', 'list', roomId],
    queryFn: () =>
      sessionsApi
        .list({ roomId: roomId! })
        .then((all) => all.filter((s) => s.status === 'SCHEDULED' || s.status === 'ACTIVE')),
    enabled: !!roomId && mode === 'multi',
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  const { data: singleSession = null, isLoading: singleLoading } = useQuery({
    queryKey: ['sessions', 'single', roomId],
    queryFn: () =>
      sessionsApi
        .list({ roomId: roomId! })
        .then((all) => all.find((s) => s.status === 'SCHEDULED' || s.status === 'ACTIVE') ?? null),
    enabled: !!roomId && mode === 'single',
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['sessions', 'participants', activeSession?.id],
    queryFn: () => sessionsApi.getParticipants(activeSession!.id),
    enabled: !!activeSession,
    staleTime: 30_000,
    select: (data) => data.filter((p) => p.status === 'ACTIVE'),
  });

  const _join = useCallback(
    async (sessionId: string, password?: string, inviteToken?: string) => {
      await sessionsApi.join(sessionId, password, inviteToken);

      // Pre-populate participants cache before setActiveSession to avoid a loading flash
      const [session, initialParticipants] = await Promise.all([
        sessionsApi.get(sessionId),
        sessionsApi.getParticipants(sessionId),
      ]);
      qc.setQueryData(['sessions', 'participants', session.id], initialParticipants);
      setActiveSession(session);

      const socket = socketManager.instance;
      if (socket?.connected) {
        const lastPosition = useSpacePresenceStore.getState().lastPosition;
        if (lastPosition) socket.emit('update_position', lastPosition);

        // Delay request_state so switchUserRoom completes first
        setTimeout(() => {
          if (socket.connected) socket.emit('request_state');
        }, 300);
      }

      await qc.invalidateQueries({ queryKey: ['sessions'] });
    },
    [qc, setActiveSession]
  );

  const createAndJoin = useMutation({
    mutationFn: async (dto: Omit<CreateSessionDto, 'roomId' | 'type'> & { title: string }) => {
      const session = await sessionsApi.create({
        roomId: roomId!,
        type: currentZoneConfig!.sessionType,
        ...dto,
      });
      await _join(session.id, dto.password);
      return session;
    },
  });

  const joinSession = useMutation({
    mutationFn: ({
      sessionId,
      password,
      inviteToken,
    }: {
      sessionId: string;
      password?: string;
      inviteToken?: string;
    }) => _join(sessionId, password, inviteToken),
  });

  const leaveSession = useMutation({
    mutationFn: () => sessionsApi.leave(activeSession!.id),
    onSuccess: () => {
      useScreenShareStore.getState().clearStream();
      setActiveSession(null);
      qc.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const startSession = useMutation({
    mutationFn: (id: string) => sessionsApi.start(id),
    onSuccess: (updated) => {
      if (activeSession?.id === updated.id) setActiveSession(updated);
      qc.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const endSession = useMutation({
    mutationFn: (id: string) => sessionsApi.end(id),
    onSuccess: () => {
      useScreenShareStore.getState().clearStream();
      setActiveSession(null);
      qc.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  return {
    mode,
    activeSession,
    sessionList,
    singleSession,
    participants,
    isLoading: listLoading || singleLoading,
    isInSession: !!activeSession,
    createAndJoin,
    joinSession,
    leaveSession,
    startSession,
    endSession,
  };
}
