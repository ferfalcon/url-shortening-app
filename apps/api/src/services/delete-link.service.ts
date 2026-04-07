import { AppError } from "../lib/app-error";
import type { LinkRepository } from "../repositories/link.repository";
import { prismaLinkRepository } from "../repositories/prisma-link.repository";

type DeleteLinkServiceDependencies = {
  linkRepository: LinkRepository;
  now?: () => Date;
};

export function buildDeleteLinkService({
  linkRepository,
  now = () => new Date()
}: DeleteLinkServiceDependencies) {
  return async function deleteLink(linkId: string, userId: string): Promise<void> {
    const wasDeleted = await linkRepository.softDeleteByIdAndCreatedByUserId(
      linkId,
      userId,
      now()
    );

    if (!wasDeleted) {
      throw new AppError(404, "LINK_NOT_FOUND", "Link not found.");
    }
  };
}

export const deleteLink = buildDeleteLinkService({
  linkRepository: prismaLinkRepository
});
