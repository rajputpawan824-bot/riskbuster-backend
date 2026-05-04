import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    creditTo: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    fileLink: { type: String, default: "" },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  },
  { timestamps: true }
);

categorySchema.index({ parent: 1, title: 1 }, { unique: true });

export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
