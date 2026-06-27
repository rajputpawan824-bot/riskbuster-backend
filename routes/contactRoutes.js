import { Router } from "express";
import { sendContactMessage } from "../controllers/contactController.js";

export const contactRouter = Router();

contactRouter.post("/", sendContactMessage);
