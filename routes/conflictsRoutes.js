import { Router } from "express";
import {
  createConflict,
  deleteConflict,
  listConflicts,
  updateConflict,
} from "../controllers/conflictsController.js";
import { authRequired } from "../middleware/authRequired.js";

export const conflictsRouter = Router();

conflictsRouter.get("/", listConflicts);
conflictsRouter.post("/", authRequired, createConflict);
conflictsRouter.put("/:id", authRequired, updateConflict);
conflictsRouter.delete("/:id", authRequired, deleteConflict);

