export interface UserSummary {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePicture?: string | null;
  avatarPreset?: string | null;
  status?: string | null;
}

export interface FriendEntry {
  friendshipId: string;
  since: string;
  friend: UserSummary;
}

export interface PendingFriendRequest {
  id: string;
  status: 'PENDING';
  requesterId: string;
  addresseeId: string;
  createdAt: string;
  updatedAt: string;
  requester: UserSummary;
  addressee: UserSummary;
}
