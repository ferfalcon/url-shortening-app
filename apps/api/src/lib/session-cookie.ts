import type { Request, Response } from "express";
import { env } from "../config/env";

const baseCookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production"
};

function getCookieValue(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = cookie.slice(0, separatorIndex).trim();

    if (key !== name) {
      continue;
    }

    return decodeURIComponent(cookie.slice(separatorIndex + 1));
  }

  return null;
}

export function readSessionIdFromRequest(req: Request) {
  return getCookieValue(req.headers.cookie, env.SESSION_COOKIE_NAME);
}

export function setSessionCookie(
  res: Response,
  sessionId: string,
  expiresAt: Date
) {
  res.cookie(env.SESSION_COOKIE_NAME, sessionId, {
    ...baseCookieOptions,
    expires: expiresAt
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(env.SESSION_COOKIE_NAME, baseCookieOptions);
}
