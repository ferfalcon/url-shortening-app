import { z } from "zod";
import {
  ApiRequestError,
  getApiErrorMessage,
  getApiUrl
} from "./api-client";

export type CreateLinkInput = {
  originalUrl: string;
  customAlias?: string;
};

export const createdLinkSchema = z.object({
  id: z.string().min(1),
  originalUrl: z.string().url(),
  shortUrl: z.string().url(),
  shortCode: z.string().min(1),
  customAlias: z.string().nullable(),
  createdAt: z.string().min(1)
});

export type CreatedLink = z.infer<typeof createdLinkSchema>;

const myLinksResponseSchema = z.object({
  links: z.array(createdLinkSchema)
});

function getDefaultErrorMessage(statusCode?: number) {
  if (statusCode === 400) {
    return "Please check the URL and optional alias, then try again.";
  }

  if (statusCode === 409) {
    return "That custom alias is already in use.";
  }

  return "We couldn't create the short link. Please try again.";
}

function getDefaultMyLinksErrorMessage(statusCode?: number) {
  if (statusCode === 401) {
    return "Authentication is required.";
  }

  return "We couldn't load your links. Please try again.";
}

async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function createLink(
  input: CreateLinkInput
): Promise<CreatedLink> {
  let response: Response;

  try {
    response = await fetch(getApiUrl("/api/links"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });
  } catch {
    throw new ApiRequestError(
      "We couldn't reach the API. Check that the backend is running and that the web app can reach it."
    );
  }

  const payload = await readJson(response);

  if (!response.ok) {
    throw new ApiRequestError(
      getApiErrorMessage(payload) ?? getDefaultErrorMessage(response.status),
      response.status
    );
  }

  const parsedResponse = createdLinkSchema.safeParse(payload);

  if (!parsedResponse.success) {
    throw new ApiRequestError("The API returned an unexpected response.");
  }

  return parsedResponse.data;
}

export async function fetchMyLinks(): Promise<CreatedLink[]> {
  let response: Response;

  try {
    response = await fetch(getApiUrl("/api/links/mine"), {
      credentials: "include"
    });
  } catch {
    throw new ApiRequestError(
      "We couldn't reach the API. Check that the backend is running and that the web app can reach it."
    );
  }

  const payload = await readJson(response);

  if (!response.ok) {
    throw new ApiRequestError(
      getApiErrorMessage(payload) ??
        getDefaultMyLinksErrorMessage(response.status),
      response.status
    );
  }

  const parsedResponse = myLinksResponseSchema.safeParse(payload);

  if (!parsedResponse.success) {
    throw new ApiRequestError("The API returned an unexpected response.");
  }

  return parsedResponse.data.links;
}
