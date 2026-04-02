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
  STUB_SHORT_BASE_URL: httpUrlSchema.default("https://stub.local")
});

export const env = envSchema.parse({
  PORT: process.env.PORT,
  STUB_SHORT_BASE_URL: process.env.STUB_SHORT_BASE_URL
});
