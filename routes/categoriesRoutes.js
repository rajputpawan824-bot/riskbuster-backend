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
categoriesRouter.post(
  "/",
  authRequired,
  upload.fields([
    { name: "file", maxCount: 1 }, // backwards compat
    { name: "files", maxCount: 10 }, // new: multiple files
  ]),
  createCategory
);
categoriesRouter.put(
  "/:id",
  authRequired,
  upload.fields([
    { name: "file", maxCount: 1 }, // backwards compat
    { name: "files", maxCount: 10 }, // new: multiple files
  ]),
  updateCategory
);
categoriesRouter.delete("/:id", authRequired, deleteCategory);

