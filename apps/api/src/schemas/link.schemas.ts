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
  .min(3, "customAlias must be between 3 and 16 characters")
  .max(16, "customAlias must be between 3 and 16 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "customAlias may contain only letters, numbers, hyphens, and underscores"
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

export const deleteLinkRequestParamsSchema = z.object({
  linkId: z.uuid("linkId must be a valid UUID")
});

export type CreateLinkRequest = z.infer<typeof createLinkRequestSchema>;
