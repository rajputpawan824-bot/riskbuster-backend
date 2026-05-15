import { Router } from "express";
import {
  createTemplate,
  deleteTemplate,
  listTemplates,
  updateTemplate,
} from "../controllers/templatesController.js";
import { authRequired } from "../middleware/authRequired.js";
import { upload } from "../middleware/upload.js";

export const templatesRouter = Router();

templatesRouter.get("/", listTemplates);
templatesRouter.post(
  "/",
  authRequired,
  upload.fields([{ name: "files", maxCount: 10 }]),
  createTemplate
);
templatesRouter.put(
  "/:id",
  authRequired,
  upload.fields([{ name: "files", maxCount: 10 }]),
  updateTemplate
);
templatesRouter.delete("/:id", authRequired, deleteTemplate);

