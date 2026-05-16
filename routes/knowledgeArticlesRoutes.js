import { Router } from "express";
import {
  createKnowledgeArticle,
  deleteKnowledgeArticle,
  getKnowledgeArticle,
  listKnowledgeArticles,
  updateKnowledgeArticle,
} from "../controllers/knowledgeArticlesController.js";
import { authRequired } from "../middleware/authRequired.js";
import { upload } from "../middleware/upload.js";

export const knowledgeArticlesRouter = Router();

knowledgeArticlesRouter.get("/", listKnowledgeArticles);
knowledgeArticlesRouter.get("/:id", getKnowledgeArticle);
knowledgeArticlesRouter.post(
  "/",
  authRequired,
  upload.fields([{ name: "files", maxCount: 10 }]),
  createKnowledgeArticle
);
knowledgeArticlesRouter.put(
  "/:id",
  authRequired,
  upload.fields([{ name: "files", maxCount: 10 }]),
  updateKnowledgeArticle
);
knowledgeArticlesRouter.delete("/:id", authRequired, deleteKnowledgeArticle);
