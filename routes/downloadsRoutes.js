import { Router } from "express";
import { recordDownload } from "../controllers/downloadsController.js";
import { authRequired } from "../middleware/authRequired.js";

export const downloadsRouter = Router();

downloadsRouter.post("/record", authRequired, recordDownload);
