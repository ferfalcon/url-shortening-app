import { Router } from "express";
import {
  getCsrfTokenController,
  getCurrentUserController,
  logInController,
  logOutController,
  signUpController
} from "../controllers/auth.controller";
import { requireCsrfToken } from "../middleware/require-csrf-token";

export const authRouter = Router();

authRouter.get("/csrf", getCsrfTokenController);
authRouter.post("/signup", requireCsrfToken, signUpController);
authRouter.post("/login", requireCsrfToken, logInController);
authRouter.post("/logout", requireCsrfToken, logOutController);
authRouter.get("/me", getCurrentUserController);
