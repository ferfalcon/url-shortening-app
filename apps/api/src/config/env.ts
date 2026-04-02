import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001)
});

export const env = envSchema.parse({
  PORT: process.env.PORT
});
