import { randomBytes, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { env } from "../config/env";
import { readCookieValueFromRequest } from "./session-cookie";

export const CSRF_COOKIE_NAME = "shortly_csrf";
export const CSRF_HEADER_NAME = "X-CSRF-Token";

const csrfCookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production"
};

function areTokensEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function createCsrfToken() {
  return randomBytes(32).toString("base64url");
}

export function readCsrfCookieToken(req: Request) {
  return readCookieValueFromRequest(req, CSRF_COOKIE_NAME);
}

export function readCsrfHeaderToken(req: Request) {
  const headerValue = req.get(CSRF_HEADER_NAME);

  if (typeof headerValue !== "string" || headerValue.length === 0) {
    return null;
  }

  return headerValue;
}

export function getOrCreateCsrfToken(req: Request, res: Response) {
  const existingToken = readCsrfCookieToken(req);

  if (existingToken) {
    return existingToken;
  }

  const nextToken = createCsrfToken();

  res.cookie(CSRF_COOKIE_NAME, nextToken, csrfCookieOptions);

  return nextToken;
}

export function hasValidCsrfToken(req: Request) {
  const cookieToken = readCsrfCookieToken(req);
  const headerToken = readCsrfHeaderToken(req);

  if (!cookieToken || !headerToken) {
    return false;
  }

  return areTokensEqual(cookieToken, headerToken);
}
