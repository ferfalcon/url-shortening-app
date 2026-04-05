import type { Request, Response } from "express";
import { getOrCreateCsrfToken } from "../lib/csrf";
import { clearSessionCookie, readSessionIdFromRequest, setSessionCookie } from "../lib/session-cookie";
import { createErrorResponse, isAppError } from "../lib/app-error";
import { authCredentialsSchema } from "../schemas/auth.schemas";
import {
  getCurrentUser,
  logIn,
  logOut,
  signUp
} from "../services/auth.service";

function respondInvalidRequest(res: Response, message: string) {
  res.status(400).json(createErrorResponse("INVALID_REQUEST", message));
}

function handleAuthError(res: Response, error: unknown) {
  if (isAppError(error)) {
    if (error.code === "AUTH_REQUIRED") {
      clearSessionCookie(res);
    }

    res
      .status(error.statusCode)
      .json(createErrorResponse(error.code, error.message));

    return;
  }

  res.status(500).json(
    createErrorResponse(
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred."
    )
  );
}

export function getCsrfTokenController(req: Request, res: Response) {
  const csrfToken = getOrCreateCsrfToken(req, res);

  res.set("Cache-Control", "no-store");
  res.status(200).json({
    csrfToken
  });
}

export async function signUpController(req: Request, res: Response) {
  const parsedRequest = authCredentialsSchema.safeParse(req.body);

  if (!parsedRequest.success) {
    const firstIssue = parsedRequest.error.issues[0];

    respondInvalidRequest(
      res,
      firstIssue?.message ?? "Invalid sign up request."
    );

    return;
  }

  try {
    const authResult = await signUp(parsedRequest.data);

    setSessionCookie(
      res,
      authResult.sessionId,
      authResult.sessionExpiresAt
    );
    res.status(201).json({
      user: authResult.user
    });
  } catch (error) {
    handleAuthError(res, error);
  }
}

export async function logInController(req: Request, res: Response) {
  const parsedRequest = authCredentialsSchema.safeParse(req.body);

  if (!parsedRequest.success) {
    const firstIssue = parsedRequest.error.issues[0];

    respondInvalidRequest(
      res,
      firstIssue?.message ?? "Invalid login request."
    );

    return;
  }

  try {
    const authResult = await logIn(parsedRequest.data);

    setSessionCookie(
      res,
      authResult.sessionId,
      authResult.sessionExpiresAt
    );
    res.status(200).json({
      user: authResult.user
    });
  } catch (error) {
    handleAuthError(res, error);
  }
}

export async function logOutController(req: Request, res: Response) {
  try {
    await logOut(readSessionIdFromRequest(req));
    clearSessionCookie(res);
    res.status(200).json({
      success: true
    });
  } catch (error) {
    handleAuthError(res, error);
  }
}

export async function getCurrentUserController(req: Request, res: Response) {
  try {
    const currentUser = await getCurrentUser(readSessionIdFromRequest(req));

    res.status(200).json(currentUser);
  } catch (error) {
    handleAuthError(res, error);
  }
}
