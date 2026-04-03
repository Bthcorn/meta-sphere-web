import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionsApi } from '@/api/sessions.api';
import { useSessionStore } from '@/store/session.store';
import { useSpacePresenceStore } from '@/store/space-presence.store';
import { socketManager } from '@/lib/socket-manager';
import type { CreateSessionDto } from '@/types/session';

export function useSession() {
  const qc = useQueryClient();
  const { activeSession, currentZoneConfig, setActiveSession } = useSessionStore();

  const roomId = currentZoneConfig?.roomId ?? null;
  const mode = currentZoneConfig?.mode ?? null;

  // ── Invalidate participants immediately on socket events ─────────────────
  useEffect(() => {
    if (!activeSession) return;

    const socket = socketManager.instance;
    if (!socket) return;

    const invalidateParticipants = () => {
      if (activeSession) {
        qc.invalidateQueries({ queryKey: ['sessions', 'participants', activeSession.id] });
      }
    };

    const invalidateSessionList = () => {
      qc.invalidateQueries({ queryKey: ['sessions', 'list', roomId] });
      qc.invalidateQueries({ queryKey: ['sessions', 'single', roomId] });
    };

    // The backend emits user_connected / user_disconnected to the session room
    // whenever a participant joins or leaves (via switchUserRoom), so these
    // events cover both initial socket connections and session room switches.
    socket.on('user_connected', invalidateParticipants);
    socket.on('user_disconnected', invalidateParticipants);
    // If your backend emits these on session state changes:
    socket.on('session:started', invalidateSessionList);
    socket.on('session:ended', invalidateSessionList);

    return () => {
      socket.off('user_connected', invalidateParticipants);
      socket.off('user_disconnected', invalidateParticipants);
      socket.off('session:started', invalidateSessionList);
      socket.off('session:ended', invalidateSessionList);
    };
  }, [activeSession, qc, roomId]);

  // ── Session list (multi mode) ────────────────────────────────────────────
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

  // ── Single active session (single mode) ──────────────────────────────────
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

  // ── Participants ─────────────────────────────────────────────────────────
  const { data: participants = [] } = useQuery({
    queryKey: ['sessions', 'participants', activeSession?.id],
    queryFn: () => sessionsApi.getParticipants(activeSession!.id),
    enabled: !!activeSession,
    staleTime: 30_000,
    select: (data) => data.filter((p) => p.status === 'ACTIVE'),
  });

  // ── Core join ────────────────────────────────────────────────────────────
  const _join = useCallback(
    async (sessionId: string, password?: string) => {
      await sessionsApi.join(sessionId, password);

      // Fetch session + participants in parallel.
      // Pre-populate the participants cache BEFORE setActiveSession so that
      // when SessionHUD mounts the data is already there and renders instantly.
      const [session, initialParticipants] = await Promise.all([
        sessionsApi.get(sessionId),
        sessionsApi.getParticipants(sessionId),
      ]);
      qc.setQueryData(['sessions', 'participants', session.id], initialParticipants);

      setActiveSession(session);

      const socket = socketManager.instance;
      if (socket?.connected) {
        // Re-broadcast our own position so other session members see our avatar
        // without waiting for our next movement input.
        const lastPosition = useSpacePresenceStore.getState().lastPosition;
        if (lastPosition) {
          socket.emit('update_position', lastPosition);
        }

        // Request a fresh presence snapshot after a short delay to allow the
        // backend's switchUserRoom to complete before we ask for state.
        // Without this delay, request_state races with switchUserRoom and can
        // return the old room's snapshot instead of the session room's.
        setTimeout(() => {
          if (socket.connected) socket.emit('request_state');
        }, 300);
      }

      await qc.invalidateQueries({ queryKey: ['sessions'] });
    },
    [qc, setActiveSession]
  );

  // ── Mutations ────────────────────────────────────────────────────────────
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
    mutationFn: ({ sessionId, password }: { sessionId: string; password?: string }) =>
      _join(sessionId, password),
  });

  const leaveSession = useMutation({
    mutationFn: () => sessionsApi.leave(activeSession!.id),
    onSuccess: () => {
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
