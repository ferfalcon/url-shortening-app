import { Router } from "express";
import { authRouter } from "./auth.routes";
import { healthRouter } from "./health.routes";
import { linksRouter } from "./links.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use(healthRouter);
apiRouter.use("/api", linksRouter);
