import { Router } from "express";
import {
  createConflict,
  deleteConflict,
  getConflict,
  listConflicts,
  updateConflict,
} from "../controllers/conflictsController.js";
import { authRequired } from "../middleware/authRequired.js";
import { upload } from "../middleware/upload.js";

export const conflictsRouter = Router();

conflictsRouter.get("/", listConflicts);
conflictsRouter.get("/:id", getConflict);
conflictsRouter.post(
  "/",
  authRequired,
  upload.fields([{ name: "images", maxCount: 10 }]),
  createConflict
);
conflictsRouter.put(
  "/:id",
  authRequired,
  upload.fields([{ name: "images", maxCount: 10 }]),
  updateConflict
);
conflictsRouter.delete("/:id", authRequired, deleteConflict);
