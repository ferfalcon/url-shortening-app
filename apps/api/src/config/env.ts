import { z } from "zod";

const httpUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  }, "Value must be a valid http or https URL");

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  SPOO_API_BASE_URL: httpUrlSchema.default("https://spoo.me/api/v1")
});

export const env = envSchema.parse({
  PORT: process.env.PORT,
  SPOO_API_BASE_URL: process.env.SPOO_API_BASE_URL
});
