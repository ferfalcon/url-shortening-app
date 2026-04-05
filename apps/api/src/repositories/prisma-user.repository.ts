import { Prisma } from "@prisma/client";
import { AppError } from "../lib/app-error";
import { prisma } from "../lib/prisma";
import type {
  CreateStoredUserInput,
  StoredUser,
  UserRepository
} from "./user.repository";

function isEmailConflict(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code !== "P2002") {
    return false;
  }

  return String(error.meta?.target).includes("email");
}

class PrismaUserRepository implements UserRepository {
  async create(input: CreateStoredUserInput): Promise<StoredUser> {
    try {
      return await prisma.user.create({
        data: input
      });
    } catch (error) {
      if (isEmailConflict(error)) {
        throw new AppError(
          409,
          "EMAIL_CONFLICT",
          "An account with that email already exists."
        );
      }

      throw error;
    }
  }

  async findByEmail(email: string): Promise<StoredUser | null> {
    return prisma.user.findUnique({
      where: {
        email
      }
    });
  }
}

export const prismaUserRepository = new PrismaUserRepository();
