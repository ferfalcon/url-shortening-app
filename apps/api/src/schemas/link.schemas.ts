import { z } from "zod";

const httpUrlSchema = z
  .string()
  .trim()
  .min(1, "originalUrl is required")
  .refine((value) => {
    try {
      const url = new URL(value);

      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "originalUrl must be a valid absolute http or https URL");

const customAliasSchema = z
  .string()
  .trim()
  .min(3, "customAlias must be between 3 and 32 characters")
  .max(32, "customAlias must be between 3 and 32 characters")
  .regex(
    /^[a-zA-Z0-9-]+$/,
    "customAlias may contain only letters, numbers, and hyphens"
  );

export const createLinkRequestSchema = z.object({
  originalUrl: httpUrlSchema,
  customAlias: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      return value.trim() === "" ? undefined : value;
    },
    customAliasSchema.optional()
  )
});

export type CreateLinkRequest = z.infer<typeof createLinkRequestSchema>;
