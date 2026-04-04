import { prisma } from "../lib/prisma";
import type {
  CreateStoredSessionInput,
  SessionRepository,
  StoredSession,
  StoredSessionWithUser
} from "./session.repository";

class PrismaSessionRepository implements SessionRepository {
  async create(input: CreateStoredSessionInput): Promise<StoredSession> {
    return prisma.session.create({
      data: input
    });
  }

  async findByIdWithUser(id: string): Promise<StoredSessionWithUser | null> {
    return prisma.session.findUnique({
      where: {
        id
      },
      include: {
        user: true
      }
    });
  }

  async deleteById(id: string): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        id
      }
    });
  }
}

export const prismaSessionRepository = new PrismaSessionRepository();
