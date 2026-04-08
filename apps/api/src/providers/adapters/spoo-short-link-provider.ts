import { z } from "zod";
import { env } from "../../config/env";
import { AppError } from "../../lib/app-error";
import type {
  CreateShortLinkInput,
  ShortLinkProvider,
  ShortLinkResult
} from "../interfaces/short-link-provider";

const spooSuccessSchema = z.object({
  alias: z.string().trim().min(1),
  short_url: z.string().url()
});

const spooErrorSchema = z
  .object({
    error: z.string().trim().min(1).optional(),
    message: z.string().trim().min(1).optional(),
    detail: z.string().trim().min(1).optional()
  })
  .passthrough();

const PROVIDER_TIMEOUT_MS = 5_000;
const PROVIDER_TIMEOUT_MESSAGE =
  "The short-link provider took too long to respond. Please try again.";
const PROVIDER_UNAVAILABLE_MESSAGE =
  "The short-link provider is unavailable right now. Please try again.";

function buildSpooEndpointUrl(pathname: string) {
  const normalizedBaseUrl = env.SPOO_API_BASE_URL.endsWith("/")
    ? env.SPOO_API_BASE_URL
    : `${env.SPOO_API_BASE_URL}/`;

  return new URL(pathname, normalizedBaseUrl).toString();
}

function extractUpstreamErrorMessage(payload: unknown) {
  const parsedPayload = spooErrorSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return null;
  }

  return (
    parsedPayload.data.error ??
    parsedPayload.data.message ??
    parsedPayload.data.detail ??
    null
  );
}

async function readJsonBody(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function isAliasConflict(statusCode: number, upstreamMessage: string | null) {
  return (
    statusCode === 409 ||
    (upstreamMessage !== null &&
      /alias/i.test(upstreamMessage) &&
      /(already|exists|taken|use)/i.test(upstreamMessage))
  );
}

function createInvalidRequestError(upstreamMessage: string | null) {
  if (upstreamMessage !== null && /alias/i.test(upstreamMessage)) {
    return new AppError(
      400,
      "INVALID_REQUEST",
      "That custom alias is not valid for this short link."
    );
  }

  if (upstreamMessage !== null && /(url|link)/i.test(upstreamMessage)) {
    return new AppError(
      400,
      "INVALID_REQUEST",
      "The shortening provider rejected that original URL."
    );
  }

  return new AppError(
    400,
    "INVALID_REQUEST",
    "The shortening provider rejected that request."
  );
}

function createProviderFailureError(message = PROVIDER_UNAVAILABLE_MESSAGE) {
  return new AppError(503, "SHORTENING_UNAVAILABLE", message);
}

class SpooShortLinkProvider implements ShortLinkProvider {
  async createShortLink(
    input: CreateShortLinkInput
  ): Promise<ShortLinkResult> {
    const abortController = new AbortController();
    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      abortController.abort();
    }, PROVIDER_TIMEOUT_MS);

    try {
      const response = await fetch(buildSpooEndpointUrl("shorten"), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          long_url: input.originalUrl,
          ...(input.customAlias ? { alias: input.customAlias } : {})
        }),
        signal: abortController.signal
      });

      const payload = await readJsonBody(response);
      const upstreamMessage = extractUpstreamErrorMessage(payload);

      if (!response.ok) {
        if (isAliasConflict(response.status, upstreamMessage)) {
          throw new AppError(
            409,
            "ALIAS_CONFLICT",
            "That custom alias is already in use."
          );
        }

        if (response.status === 400 || response.status === 422) {
          throw createInvalidRequestError(upstreamMessage);
        }

        throw createProviderFailureError();
      }

      const parsedPayload = spooSuccessSchema.safeParse(payload);

      if (!parsedPayload.success) {
        throw createProviderFailureError(
          "The short-link provider returned an unexpected response."
        );
      }

      return {
        shortCode: parsedPayload.data.alias,
        shortUrl: parsedPayload.data.short_url
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (
        didTimeout ||
        (error instanceof DOMException &&
          (error.name === "AbortError" || error.name === "TimeoutError"))
      ) {
        throw createProviderFailureError(PROVIDER_TIMEOUT_MESSAGE);
      }

      if (error instanceof TypeError) {
        throw createProviderFailureError();
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const spooShortLinkProvider = new SpooShortLinkProvider();
