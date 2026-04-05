import type { Request, Response } from "express";
import { createErrorResponse, isAppError } from "../lib/app-error";
import { clearSessionCookie, readSessionIdFromRequest } from "../lib/session-cookie";
import { getCurrentUser } from "../services/auth.service";
import { getMyLinks } from "../services/get-my-links.service";

export async function getMyLinksController(req: Request, res: Response) {
  try {
    const currentUser = await getCurrentUser(readSessionIdFromRequest(req));
    const response = await getMyLinks(currentUser.user.id);

    res.status(200).json(response);
  } catch (error) {
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
}
