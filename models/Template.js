import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    /**
     * Backwards-compatible single link.
     * Prefer `fileLinks` for new features (multiple files per template).
     */
    fileLink: { type: String, default: "" },
    fileLinks: { type: [String], default: [] },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

templateSchema.index({ title: 1 }, { unique: true });

export const Template = mongoose.models.Template || mongoose.model("Template", templateSchema);

