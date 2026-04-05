import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL
});

const prismaClient = new PrismaClient({
  adapter
});

export const prisma: PrismaClient = prismaClient;
