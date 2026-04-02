import { createHash } from "node:crypto";
import { env } from "../../config/env";
import type {
  CreateShortLinkInput,
  ShortLinkProvider,
  ShortLinkResult
} from "../interfaces/short-link-provider";

function buildShortUrl(baseUrl: string, shortCode: string) {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  return new URL(shortCode, normalizedBaseUrl).toString();
}

class StubShortLinkProvider implements ShortLinkProvider {
  async createShortLink(
    input: CreateShortLinkInput
  ): Promise<ShortLinkResult> {
    const shortCode =
      input.customAlias ??
      createHash("sha256").update(input.originalUrl).digest("hex").slice(0, 6);

    return {
      shortCode,
      shortUrl: buildShortUrl(env.STUB_SHORT_BASE_URL, shortCode)
    };
  }
}

export const stubShortLinkProvider = new StubShortLinkProvider();
