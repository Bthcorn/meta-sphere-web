export type SessionType = 'STUDY' | 'MEETING' | 'WORKSHOP' | 'SOCIAL';
export type SessionStatus = 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
export type ParticipantRole = 'HOST' | 'PARTICIPANT';
export type ParticipantStatus = 'ACTIVE' | 'LEFT' | 'KICKED';

export interface Session {
  id: string;
  title: string;
  description?: string;
  type: SessionType;
  status: SessionStatus;
  hostId: string;
  roomId: string;
  isLocked: boolean;
  hasPassword: boolean;
  scheduledStartTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  _count?: { sessionParticipants: number };
  createdAt: string;
}

export interface Participant {
  userId: string;
  sessionId: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  joinedAt: string;
  leftAt?: string;
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarPreset?: string;
  };
}

export interface CreateSessionDto {
  roomId: string;
  title: string;
  type: SessionType;
  description?: string;
  password?: string;
  scheduledStartTime?: string;
}
