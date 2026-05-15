import mongoose from "mongoose";

const conflictSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Active", "Outdated"], required: true, default: "Active" },
    conflictType: {
      type: String,
      enum: ["high", "low", "medium", "critical"],
      required: true,
      default: "low",
    },
    /** Geographic reach of the conflict's impact: local / regional / global */
    impact: {
      type: String,
      enum: ["local", "regional", "global"],
      default: null,
    },
    date: { type: String, required: true },
    /** Primary image (kept for backward compatibility). */
    imageLink: { type: String, default: "" },
    /** All uploaded images for this conflict. */
    imageLinks: { type: [String], default: [] },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

conflictSchema.index({ country: 1 });
conflictSchema.index({ status: 1 });
conflictSchema.index({ date: -1 });

export const Conflict = mongoose.models.Conflict || mongoose.model("Conflict", conflictSchema);

