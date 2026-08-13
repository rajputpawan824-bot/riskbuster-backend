import { Router } from "express";
import {
  createKnowledgeArticle,
  deleteKnowledgeArticle,
  getKnowledgeArticle,
  listKnowledgeArticles,
  updateKnowledgeArticle,
} from "../controllers/knowledgeArticlesController.js";
import { authRequired, adminRequired } from "../middleware/authRequired.js";
import { upload } from "../middleware/upload.js";

export const knowledgeArticlesRouter = Router();

knowledgeArticlesRouter.get("/", listKnowledgeArticles);
knowledgeArticlesRouter.get("/:id", getKnowledgeArticle);
knowledgeArticlesRouter.post(
  "/",
  authRequired,
  adminRequired,
  upload.fields([{ name: "files", maxCount: 10 }]),
  createKnowledgeArticle
);
knowledgeArticlesRouter.put(
  "/:id",
  authRequired,
  adminRequired,
  upload.fields([{ name: "files", maxCount: 10 }]),
  updateKnowledgeArticle
);
knowledgeArticlesRouter.delete("/:id", authRequired, adminRequired, deleteKnowledgeArticle);

