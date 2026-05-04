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
    date: { type: String, required: true },
  },
  { timestamps: true }
);

conflictSchema.index({ country: 1 });
conflictSchema.index({ status: 1 });
conflictSchema.index({ date: -1 });

export const Conflict = mongoose.models.Conflict || mongoose.model("Conflict", conflictSchema);

