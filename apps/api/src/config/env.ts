import { z } from "zod";

const httpUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  }, "Value must be a valid http or https URL");

const postgresUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);

    return url.protocol === "postgres:" || url.protocol === "postgresql:";
  }, "DATABASE_URL must be a valid postgres or postgresql URL");

const envSchema = z.object({
  DATABASE_URL: postgresUrlSchema,
  PORT: z.coerce.number().int().positive().default(3001),
  SPOO_API_BASE_URL: httpUrlSchema.default("https://spoo.me/api/v1")
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT,
  SPOO_API_BASE_URL: process.env.SPOO_API_BASE_URL
});
