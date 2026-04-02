import express from "express";
import { apiRouter } from "../routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());
  app.use(apiRouter);

  app.use((_req, res) => {
    res.status(404).json({ message: "Not Found" });
  });

  return app;
}
