export type StoredLink = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
  customAlias: string | null;
  createdAt: Date;
};

export type CreateStoredLinkInput = StoredLink;

export interface LinkRepository {
  create(input: CreateStoredLinkInput): Promise<StoredLink>;
  findByCustomAlias(customAlias: string): Promise<StoredLink | null>;
}
