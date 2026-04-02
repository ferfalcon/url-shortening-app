import { Prisma } from "@prisma/client";
import { AppError } from "../lib/app-error";
import { prisma } from "../lib/prisma";
import type {
  CreateStoredLinkInput,
  LinkRepository,
  StoredLink
} from "./link.repository";

function isCustomAliasConflict(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code !== "P2002") {
    return false;
  }

  return String(error.meta?.target).includes("customAlias");
}

class PrismaLinkRepository implements LinkRepository {
  async create(input: CreateStoredLinkInput): Promise<StoredLink> {
    try {
      return await prisma.link.create({
        data: input
      });
    } catch (error) {
      if (isCustomAliasConflict(error)) {
        throw new AppError(
          409,
          "ALIAS_CONFLICT",
          "That custom alias is already in use."
        );
      }

      throw error;
    }
  }

  async findByCustomAlias(customAlias: string): Promise<StoredLink | null> {
    return prisma.link.findUnique({
      where: {
        customAlias
      }
    });
  }
}

export const prismaLinkRepository = new PrismaLinkRepository();
