import { Router } from "express";
import { createLinkController } from "../controllers/create-link.controller";

export const linksRouter = Router();

linksRouter.post("/links", createLinkController);
