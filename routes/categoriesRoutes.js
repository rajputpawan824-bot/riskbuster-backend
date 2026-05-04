import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../controllers/categoriesController.js";
import { authRequired } from "../middleware/authRequired.js";
import { upload } from "../middleware/upload.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", listCategories);
categoriesRouter.post("/", authRequired, upload.single("file"), createCategory);
categoriesRouter.put("/:id", authRequired, upload.single("file"), updateCategory);
categoriesRouter.delete("/:id", authRequired, deleteCategory);

