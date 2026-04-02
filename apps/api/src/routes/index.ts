import { Router } from "express";
import { healthRouter } from "./health.routes";
import { linksRouter } from "./links.routes";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use("/api", linksRouter);
