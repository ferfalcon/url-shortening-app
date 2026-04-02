import express from "express";
import { apiRouter } from "../routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

    if (req.method === "OPTIONS") {
      res.sendStatus(204);

      return;
    }

    next();
  });
  app.use(express.json());
  app.use(apiRouter);

  app.use((_req, res) => {
    res.status(404).json({ message: "Not Found" });
  });

  return app;
}
