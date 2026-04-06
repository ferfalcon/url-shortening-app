import { Router } from "express";
import { createLinkController } from "../controllers/create-link.controller";
import { deleteLinkController } from "../controllers/delete-link.controller";
import { getMyLinksController } from "../controllers/get-my-links.controller";
import { requireCsrfToken } from "../middleware/require-csrf-token";

export const linksRouter = Router();

linksRouter.get("/links/mine", getMyLinksController);
linksRouter.post("/links", createLinkController);
linksRouter.delete("/links/:linkId", requireCsrfToken, deleteLinkController);
