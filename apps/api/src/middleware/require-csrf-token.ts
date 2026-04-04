import type { Request, Response, NextFunction } from "express";
import { createErrorResponse } from "../lib/app-error";
import { hasValidCsrfToken } from "../lib/csrf";

export function requireCsrfToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!hasValidCsrfToken(req)) {
    res.status(403).json(
      createErrorResponse(
        "CSRF_INVALID",
        "Invalid or missing CSRF token."
      )
    );

    return;
  }

  next();
}
