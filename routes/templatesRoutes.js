import { Router } from "express";
import {
  createTemplate,
  deleteTemplate,
  listTemplates,
  updateTemplate,
} from "../controllers/templatesController.js";
import { authRequired, adminRequired } from "../middleware/authRequired.js";
import { upload } from "../middleware/upload.js";

export const templatesRouter = Router();

templatesRouter.get("/", listTemplates);
templatesRouter.post(
  "/",
  authRequired,
  adminRequired,
  upload.fields([{ name: "files", maxCount: 10 }]),
  createTemplate
);
templatesRouter.put(
  "/:id",
  authRequired,
  adminRequired,
  upload.fields([{ name: "files", maxCount: 10 }]),
  updateTemplate
);
templatesRouter.delete("/:id", authRequired, adminRequired, deleteTemplate);


