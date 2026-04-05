import { z } from "zod";
import { webEnv } from "../lib/env";

const apiErrorSchema = z.object({
  error: z.object({
    message: z.string().min(1)
  })
});

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export function getApiUrl(pathname: string) {
  const normalizedPathname = pathname.startsWith("/")
    ? pathname.slice(1)
    : pathname;

  if (!webEnv.VITE_API_BASE_URL) {
    if (import.meta.env.DEV) {
      return `/${normalizedPathname}`;
    }

    throw new ApiRequestError("VITE_API_BASE_URL is not configured.");
  }

  const baseUrl = webEnv.VITE_API_BASE_URL.endsWith("/")
    ? webEnv.VITE_API_BASE_URL
    : `${webEnv.VITE_API_BASE_URL}/`;

  return new URL(normalizedPathname, baseUrl).toString();
}

export function getApiErrorMessage(payload: unknown) {
  const parsedPayload = apiErrorSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return null;
  }

  return parsedPayload.data.error.message;
}
