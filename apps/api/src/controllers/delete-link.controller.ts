import type { Request, Response } from "express";
import { createErrorResponse, isAppError } from "../lib/app-error";
import { clearSessionCookie, readSessionIdFromRequest } from "../lib/session-cookie";
import { deleteLinkRequestParamsSchema } from "../schemas/link.schemas";
import { getCurrentUser } from "../services/auth.service";
import { deleteLink } from "../services/delete-link.service";

export async function deleteLinkController(req: Request, res: Response) {
  const parsedParams = deleteLinkRequestParamsSchema.safeParse(req.params);

  if (!parsedParams.success) {
    const firstIssue = parsedParams.error.issues[0];

    res.status(400).json(
      createErrorResponse(
        "INVALID_REQUEST",
        firstIssue?.message ?? "Invalid link deletion request."
      )
    );

    return;
  }

  try {
    const currentUser = await getCurrentUser(readSessionIdFromRequest(req));

    await deleteLink(parsedParams.data.linkId, currentUser.user.id);

    res.status(204).send();
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
