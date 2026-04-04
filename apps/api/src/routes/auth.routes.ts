import { Router } from "express";
import {
  getCurrentUserController,
  logInController,
  logOutController,
  signUpController
} from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/signup", signUpController);
authRouter.post("/login", logInController);
authRouter.post("/logout", logOutController);
authRouter.get("/me", getCurrentUserController);
