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
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  SESSION_COOKIE_NAME: z.string().trim().min(1).default("shortly_session"),
  SESSION_DURATION_HOURS: z.coerce.number().int().positive().default(168),
  SPOO_API_BASE_URL: httpUrlSchema.default("https://spoo.me/api/v1"),
  WEB_ORIGIN: httpUrlSchema.default("http://localhost:5173")
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  SESSION_DURATION_HOURS: process.env.SESSION_DURATION_HOURS,
  SPOO_API_BASE_URL: process.env.SPOO_API_BASE_URL,
  WEB_ORIGIN: process.env.WEB_ORIGIN
});
