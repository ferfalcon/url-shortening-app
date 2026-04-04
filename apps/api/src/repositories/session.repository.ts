import type { StoredUser } from "./user.repository";

export type StoredSession = {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
};

export type StoredSessionWithUser = StoredSession & {
  user: StoredUser;
};

export type CreateStoredSessionInput = StoredSession;

export interface SessionRepository {
  create(input: CreateStoredSessionInput): Promise<StoredSession>;
  findByIdWithUser(id: string): Promise<StoredSessionWithUser | null>;
  deleteById(id: string): Promise<void>;
}
