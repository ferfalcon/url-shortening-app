export type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

export type CreateStoredUserInput = StoredUser;

export interface UserRepository {
  create(input: CreateStoredUserInput): Promise<StoredUser>;
  findByEmail(email: string): Promise<StoredUser | null>;
}
