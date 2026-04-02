import type { Request, Response } from "express";
import { getHealthStatus } from "../services/health.service";

export function getHealthController(_req: Request, res: Response) {
  res.json(getHealthStatus());
}
