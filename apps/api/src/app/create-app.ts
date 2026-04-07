import express from "express";
import { env } from "../config/env";
import { apiRouter } from "../routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "Content-Type, X-CSRF-Token");
    res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");

    if (req.headers.origin === env.WEB_ORIGIN) {
      res.header("Access-Control-Allow-Origin", env.WEB_ORIGIN);
      res.header("Access-Control-Allow-Credentials", "true");
      res.vary("Origin");
    }

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
