import type { LinkRepository, StoredLink } from "../repositories/link.repository";
import { prismaLinkRepository } from "../repositories/prisma-link.repository";

export type MyLinksItem = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
  customAlias: string | null;
  createdAt: string;
};

export type MyLinksResponse = {
  links: MyLinksItem[];
};

type GetMyLinksServiceDependencies = {
  linkRepository: LinkRepository;
};

function mapStoredLinkToMyLinksItem(link: StoredLink): MyLinksItem {
  return {
    id: link.id,
    originalUrl: link.originalUrl,
    shortUrl: link.shortUrl,
    shortCode: link.shortCode,
    customAlias: link.customAlias,
    createdAt: link.createdAt.toISOString()
  };
}

export function buildGetMyLinksService({
  linkRepository
}: GetMyLinksServiceDependencies) {
  return async function getMyLinks(userId: string): Promise<MyLinksResponse> {
    const links = await linkRepository.findManyByCreatedByUserId(userId);

    return {
      links: links.map(mapStoredLinkToMyLinksItem)
    };
  };
}

export const getMyLinks = buildGetMyLinksService({
  linkRepository: prismaLinkRepository
});
