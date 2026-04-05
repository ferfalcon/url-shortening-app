import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "email is required")
  .email("email must be a valid email address")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "password must be at least 8 characters long");

export const authCredentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;
