export type StoredLink = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
  customAlias: string | null;
  createdAt: Date;
  deletedAt: Date | null;
  createdByUserId: string | null;
};

export type CreateStoredLinkInput = Omit<StoredLink, "deletedAt"> & {
  deletedAt?: Date | null;
};

export interface LinkRepository {
  create(input: CreateStoredLinkInput): Promise<StoredLink>;
  findByCustomAlias(customAlias: string): Promise<StoredLink | null>;
  findManyByCreatedByUserId(userId: string): Promise<StoredLink[]>;
  softDeleteByIdAndCreatedByUserId(
    linkId: string,
    userId: string,
    deletedAt: Date
  ): Promise<boolean>;
}
