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

export type AuthCredentialsInput = {
  email: string;
  password: string;
};

export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;

type AuthAction = "login" | "logout" | "me" | "signup";

function getDefaultAuthErrorMessage(
  action: AuthAction,
  statusCode?: number
) {
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

export function logIn(input: AuthCredentialsInput) {
  return requestAuthenticatedUser("/auth/login", "login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
}

export function signUp(input: AuthCredentialsInput) {
  return requestAuthenticatedUser("/auth/signup", "signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
}

export async function logOut() {
  let response: Response;

  try {
    response = await fetch(getApiUrl("/auth/logout"), {
      method: "POST",
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
        getDefaultAuthErrorMessage("logout", response.status),
      response.status
    );
  }

  const parsedResponse = logoutResponseSchema.safeParse(payload);

  if (!parsedResponse.success) {
    throw new ApiRequestError("The auth API returned an unexpected response.");
  }
}
