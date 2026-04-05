import { Router } from "express";
import { createLinkController } from "../controllers/create-link.controller";
import { getMyLinksController } from "../controllers/get-my-links.controller";

export const linksRouter = Router();

linksRouter.get("/links/mine", getMyLinksController);
linksRouter.post("/links", createLinkController);
