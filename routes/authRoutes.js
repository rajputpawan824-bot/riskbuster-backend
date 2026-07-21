import { Router } from "express";
import { login, register, listUsers } from "../controllers/authController.js";
import { authRequired } from "../middleware/authRequired.js";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.get("/users", authRequired, listUsers);
