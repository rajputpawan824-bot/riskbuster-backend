import mongoose from "mongoose";
import { Country } from "../models/Country.js";

function serializeCountry(doc) {
  const row = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(row._id),
    label: row.label,
    flag: row.flag || "",
    region: row.region || "",
  };
}

export async function listCountries(_req, res) {
  try {
    const docs = await Country.find({ isDeleted: { $ne: true } })
      .sort({ label: 1 })
      .exec();
    res.json(docs.map((d) => serializeCountry(d)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load countries" });
  }
}

export async function createCountry(req, res) {
  try {
    const { label, flag, region } = req.body || {};
    if (!label || !String(label).trim()) {
      return res.status(400).json({ error: "Country name is required" });
    }
    const doc = await Country.create({
      label: String(label).trim(),
      flag: flag != null ? String(flag).trim() : "",
      region: region != null ? String(region).trim() : "",
    });
    res.status(201).json(serializeCountry(doc));
  } catch (e) {
    if (e && e.code === 11000) {
      return res.status(409).json({ error: "A country with this name already exists" });
    }
    console.error(e);
    res.status(500).json({ error: "Failed to create country" });
  }
}

export async function updateCountry(req, res) {
  try {
    const { id } = req.params;
    const { label, flag, region } = req.body || {};
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid country id" });
    }
    if (!label || !String(label).trim()) {
      return res.status(400).json({ error: "Country name is required" });
    }
    const doc = await Country.findById(id);
    if (!doc || doc.isDeleted) return res.status(404).json({ error: "Not found" });

    doc.label = String(label).trim();
    doc.flag = flag != null ? String(flag).trim() : "";
    doc.region = region != null ? String(region).trim() : "";
    await doc.save();
    res.json(serializeCountry(doc));
  } catch (e) {
    if (e && e.code === 11000) {
      return res.status(409).json({ error: "A country with this name already exists" });
    }
    console.error(e);
    res.status(500).json({ error: "Failed to update country" });
  }
}

export async function deleteCountry(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid country id" });
    }
    const doc = await Country.findById(id);
    if (!doc || doc.isDeleted) return res.status(404).json({ error: "Not found" });
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    await doc.save();
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete country" });
  }
}
