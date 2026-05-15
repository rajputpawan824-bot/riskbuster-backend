import mongoose from "mongoose";

const countrySchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    flag: { type: String, default: "", trim: true },
    /** Geographic world region this country belongs to. */
    region: { type: String, default: "", trim: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

countrySchema.index({ label: 1 }, { unique: true });

export const Country = mongoose.models.Country || mongoose.model("Country", countrySchema);
