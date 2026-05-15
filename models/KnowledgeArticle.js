import mongoose from "mongoose";

const knowledgeArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    /** Rich-text description stored as sanitized HTML. */
    description: { type: String, required: true },
    country: { type: String, default: "", trim: true },
    /** Posted/published date as YYYY-MM-DD. */
    postedDate: { type: String, required: true },
    /** Primary image (kept for convenience / backward compatibility). */
    imageLink: { type: String, default: "" },
    /** All uploaded images for this article. */
    imageLinks: { type: [String], default: [] },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

knowledgeArticleSchema.index({ country: 1 });
knowledgeArticleSchema.index({ postedDate: -1 });

export const KnowledgeArticle =
  mongoose.models.KnowledgeArticle ||
  mongoose.model("KnowledgeArticle", knowledgeArticleSchema);
