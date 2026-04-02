import { randomUUID } from "node:crypto";
import { AppError } from "../lib/app-error";
import { spooShortLinkProvider } from "../providers/adapters/spoo-short-link-provider";
import type { LinkRepository, StoredLink } from "../repositories/link.repository";
import { prismaLinkRepository } from "../repositories/prisma-link.repository";
import type { CreateLinkRequest } from "../schemas/link.schemas";
import type { ShortLinkProvider } from "../providers/interfaces/short-link-provider";

export type CreatedLinkResponse = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
  customAlias: string | null;
  createdAt: string;
};

type CreateLinkServiceDependencies = {
  linkRepository: LinkRepository;
  shortLinkProvider: ShortLinkProvider;
  createId?: () => string;
  now?: () => Date;
};

function mapStoredLinkToResponse(link: StoredLink): CreatedLinkResponse {
  return {
    id: link.id,
    originalUrl: link.originalUrl,
    shortUrl: link.shortUrl,
    shortCode: link.shortCode,
    customAlias: link.customAlias,
    createdAt: link.createdAt.toISOString()
  };
}

export function buildCreateLinkService({
  linkRepository,
  shortLinkProvider,
  createId = randomUUID,
  now = () => new Date()
}: CreateLinkServiceDependencies) {
  return async function createLink(
    input: CreateLinkRequest
  ): Promise<CreatedLinkResponse> {
    if (input.customAlias) {
      const existingLink = await linkRepository.findByCustomAlias(
        input.customAlias
      );

      if (existingLink) {
        throw new AppError(
          409,
          "ALIAS_CONFLICT",
          "That custom alias is already in use."
        );
      }
    }

    const shortLink = await shortLinkProvider.createShortLink({
      originalUrl: input.originalUrl,
      ...(input.customAlias ? { customAlias: input.customAlias } : {})
    });

    const storedLink = await linkRepository.create({
      id: createId(),
      originalUrl: input.originalUrl,
      shortUrl: shortLink.shortUrl,
      shortCode: shortLink.shortCode,
      customAlias: input.customAlias ?? null,
      createdAt: now()
    });

    return mapStoredLinkToResponse(storedLink);
  };
}

export const createLink = buildCreateLinkService({
  linkRepository: prismaLinkRepository,
  shortLinkProvider: spooShortLinkProvider
});
