import { Router } from "express";
import { login, register, listUsers, forgotPassword, resetPassword } from "../controllers/authController.js";
import { authRequired } from "../middleware/authRequired.js";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.get("/users", authRequired, listUsers);

