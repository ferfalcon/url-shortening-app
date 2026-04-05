export type StoredLink = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
  customAlias: string | null;
  createdAt: Date;
  createdByUserId: string | null;
};

export type CreateStoredLinkInput = StoredLink;

export interface LinkRepository {
  create(input: CreateStoredLinkInput): Promise<StoredLink>;
  findByCustomAlias(customAlias: string): Promise<StoredLink | null>;
  findManyByCreatedByUserId(userId: string): Promise<StoredLink[]>;
}
