import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    creditTo: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    /**
     * Backwards-compatible single link.
     * Prefer `fileLinks` for new features (multiple files per category).
     */
    fileLink: { type: String, default: "" },
    /** Multiple uploaded file links under `/uploads/...` (and/or external links). */
    fileLinks: { type: [String], default: [] },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

categorySchema.index({ parent: 1, title: 1 }, { unique: true });

export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
