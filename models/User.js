import mongoose from "mongoose";

const downloadDocumentSchema = new mongoose.Schema(
  {
    documentType: { type: String, required: true, trim: true },
    documentId: { type: String, default: "" },
    title: { type: String, default: "" },
    fileLink: { type: String, required: true, trim: true },
    downloadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },
    country: { type: String, trim: true, default: "" },
    download_document: { type: [downloadDocumentSchema], default: [] },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
