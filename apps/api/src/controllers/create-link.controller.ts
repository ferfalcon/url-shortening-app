import type { Request, Response } from "express";
import { createErrorResponse, isAppError } from "../lib/app-error";
import { readSessionIdFromRequest } from "../lib/session-cookie";
import { createLinkRequestSchema } from "../schemas/link.schemas";
import { getOptionalCurrentUser } from "../services/auth.service";
import { createLink } from "../services/create-link.service";

export async function createLinkController(req: Request, res: Response) {
  const parsedRequest = createLinkRequestSchema.safeParse(req.body);

  if (!parsedRequest.success) {
    const firstIssue = parsedRequest.error.issues[0];

    res.status(400).json(
      createErrorResponse(
        "INVALID_REQUEST",
        firstIssue?.message ?? "Invalid link creation request."
      )
    );

    return;
  }

  try {
    const currentUser = await getOptionalCurrentUser(
      readSessionIdFromRequest(req)
    );
    const link = await createLink(parsedRequest.data, currentUser?.id ?? null);

    res.status(201).json(link);
  } catch (error) {
    if (isAppError(error)) {
      res.status(error.statusCode).json(
        createErrorResponse(error.code, error.message)
      );

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
