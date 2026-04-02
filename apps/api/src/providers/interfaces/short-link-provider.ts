export type CreateShortLinkInput = {
  originalUrl: string;
  customAlias?: string;
};

export type ShortLinkResult = {
  shortUrl: string;
  shortCode: string;
};

export interface ShortLinkProvider {
  createShortLink(input: CreateShortLinkInput): Promise<ShortLinkResult>;
}
