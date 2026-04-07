import { z } from "zod";
import {
  ApiRequestError,
  getApiErrorMessage,
  getApiUrl
} from "./api-client";

const authenticatedUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  createdAt: z.string().min(1)
});

const authenticatedUserResponseSchema = z.object({
  user: authenticatedUserSchema
});

const logoutResponseSchema = z.object({
  success: z.literal(true)
});

const csrfResponseSchema = z.object({
  csrfToken: z.string().min(1)
});

const apiErrorCodeSchema = z.object({
  error: z.object({
    code: z.string().min(1)
  })
});

export type AuthCredentialsInput = {
  email: string;
  password: string;
};

export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;

type AuthAction = "csrf" | "login" | "logout" | "me" | "signup";

let csrfToken: string | null = null;
let csrfTokenRequest: Promise<string> | null = null;

function getDefaultAuthErrorMessage(
  action: AuthAction,
  statusCode?: number
) {
  if (action === "csrf") {
    return "We couldn't prepare the security check for this form. Please try again.";
  }

  if (
    (action === "login" || action === "logout" || action === "signup") &&
    statusCode === 403
  ) {
    return "Security check failed. Please refresh and try again.";
  }

  if (action === "login" && statusCode === 401) {
    return "Invalid email or password.";
  }

  if (action === "signup" && statusCode === 409) {
    return "An account with that email already exists.";
  }

  if ((action === "login" || action === "signup") && statusCode === 400) {
    return "Please check your email and password, then try again.";
  }

  if (action === "logout") {
    return "We couldn't sign you out. Please try again.";
  }

  if (action === "me" && statusCode === 401) {
    return "Authentication is required.";
  }

  return "We couldn't complete that auth request. Please try again.";
}

async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getApiErrorCode(payload: unknown) {
  const parsedPayload = apiErrorCodeSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return null;
  }

  return parsedPayload.data.error.code;
}

export function clearCachedCsrfToken() {
  csrfToken = null;
}

async function fetchCsrfTokenFromApi() {
  let response: Response;

  try {
    response = await fetch(getApiUrl("/auth/csrf"), {
      credentials: "include"
    });
  } catch {
    throw new ApiRequestError(
      "We couldn't reach the auth API. Check that the backend is running and that the web app can reach it."
    );
  }

  const payload = await readJson(response);

  if (!response.ok) {
    throw new ApiRequestError(
      getApiErrorMessage(payload) ??
        getDefaultAuthErrorMessage("csrf", response.status),
      response.status
    );
  }

  const parsedResponse = csrfResponseSchema.safeParse(payload);

  if (!parsedResponse.success) {
    throw new ApiRequestError("The auth API returned an unexpected response.");
  }

  return parsedResponse.data.csrfToken;
}

async function ensureCsrfToken() {
  if (csrfToken) {
    return csrfToken;
  }

  if (!csrfTokenRequest) {
    csrfTokenRequest = fetchCsrfTokenFromApi().then((nextToken) => {
      csrfToken = nextToken;

      return nextToken;
    });

    void csrfTokenRequest.finally(() => {
      csrfTokenRequest = null;
    });
  }

  return csrfTokenRequest;
}

function createHeaders(
  csrfToken: string | null,
  headers?: HeadersInit
) {
  const nextHeaders = new Headers(headers);

  if (csrfToken) {
    nextHeaders.set("X-CSRF-Token", csrfToken);
  }

  return nextHeaders;
}

export async function createCsrfHeaders(headers?: HeadersInit) {
  return createHeaders(await ensureCsrfToken(), headers);
}

async function requestAuthenticatedUser(
  pathname: string,
  action: AuthAction,
  init?: RequestInit
): Promise<AuthenticatedUser> {
  let response: Response;

  try {
    response = await fetch(getApiUrl(pathname), {
      ...init,
      credentials: "include"
    });
  } catch {
    throw new ApiRequestError(
      "We couldn't reach the auth API. Check that the backend is running and that the web app can reach it."
    );
  }

  const payload = await readJson(response);

  if (!response.ok) {
    if (getApiErrorCode(payload) === "CSRF_INVALID") {
      clearCachedCsrfToken();
    }

    throw new ApiRequestError(
      getApiErrorMessage(payload) ??
        getDefaultAuthErrorMessage(action, response.status),
      response.status
    );
  }

  const parsedResponse = authenticatedUserResponseSchema.safeParse(payload);

  if (!parsedResponse.success) {
    throw new ApiRequestError("The auth API returned an unexpected response.");
  }

  return parsedResponse.data.user;
}

export function fetchCurrentUser() {
  return requestAuthenticatedUser("/auth/me", "me");
}

export async function prefetchCsrfToken() {
  try {
    await ensureCsrfToken();
  } catch {
    // Keep the landing page usable even if the auth API is temporarily unavailable.
  }
}

export function logIn(input: AuthCredentialsInput) {
  return ensureCsrfToken().then((csrfToken) =>
    requestAuthenticatedUser("/auth/login", "login", {
      method: "POST",
      headers: createHeaders(csrfToken, {
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(input)
    })
  );
}

export function signUp(input: AuthCredentialsInput) {
  return ensureCsrfToken().then((csrfToken) =>
    requestAuthenticatedUser("/auth/signup", "signup", {
      method: "POST",
      headers: createHeaders(csrfToken, {
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(input)
    })
  );
}

export async function logOut() {
  const currentCsrfToken = await ensureCsrfToken();
  let response: Response;

  try {
    response = await fetch(getApiUrl("/auth/logout"), {
      method: "POST",
      credentials: "include",
      headers: createHeaders(currentCsrfToken)
    });
  } catch {
    throw new ApiRequestError(
      "We couldn't reach the auth API. Check that the backend is running and that the web app can reach it."
    );
  }

  const payload = await readJson(response);

  if (!response.ok) {
    if (getApiErrorCode(payload) === "CSRF_INVALID") {
      clearCachedCsrfToken();
    }

    throw new ApiRequestError(
      getApiErrorMessage(payload) ??
        getDefaultAuthErrorMessage("logout", response.status),
      response.status
    );
  }

  const parsedResponse = logoutResponseSchema.safeParse(payload);

  if (!parsedResponse.success) {
    throw new ApiRequestError("The auth API returned an unexpected response.");
  }
}
