import type { Request, RequestHandler } from "express";
import { createErrorResponse } from "../lib/app-error";
import { readSessionIdFromRequest } from "../lib/session-cookie";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_EXCEEDED_MESSAGE =
  "Too many link creation requests. Please wait a minute and try again.";

type RateLimitEntry = {
  count: number;
  windowStartedAt: number;
};

const requestCountsByKey = new Map<string, RateLimitEntry>();
let lastPrunedAt = 0;

function readForwardedIp(req: Request) {
  const forwardedForHeader = req.headers["x-forwarded-for"];
  const forwardedForValue = Array.isArray(forwardedForHeader)
    ? forwardedForHeader[0]
    : forwardedForHeader;

  if (!forwardedForValue) {
    return null;
  }

  const firstForwardedIp = forwardedForValue.split(",")[0]?.trim();

  return firstForwardedIp ? firstForwardedIp : null;
}

function createRateLimitKey(req: Request) {
  const sessionId = readSessionIdFromRequest(req);

  if (sessionId) {
    return `session:${sessionId}`;
  }

  const requestIp =
    readForwardedIp(req) ?? req.ip ?? req.socket.remoteAddress ?? "unknown";

  return `ip:${requestIp}`;
}

function pruneExpiredEntries(now: number) {
  if (now - lastPrunedAt < RATE_LIMIT_WINDOW_MS) {
    return;
  }

  for (const [key, entry] of requestCountsByKey.entries()) {
    if (entry.windowStartedAt + RATE_LIMIT_WINDOW_MS <= now) {
      requestCountsByKey.delete(key);
    }
  }

  lastPrunedAt = now;
}

export const rateLimitCreateLink: RequestHandler = (req, res, next) => {
  const now = Date.now();

  pruneExpiredEntries(now);

  const key = createRateLimitKey(req);
  const entry = requestCountsByKey.get(key);

  if (!entry || entry.windowStartedAt + RATE_LIMIT_WINDOW_MS <= now) {
    requestCountsByKey.set(key, {
      count: 1,
      windowStartedAt: now
    });
    next();

    return;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil(
      (entry.windowStartedAt + RATE_LIMIT_WINDOW_MS - now) / 1000
    );

    res
      .set("Retry-After", retryAfterSeconds.toString())
      .status(429)
      .json(
        createErrorResponse("RATE_LIMITED", RATE_LIMIT_EXCEEDED_MESSAGE)
      );

    return;
  }

  entry.count += 1;
  next();
};
