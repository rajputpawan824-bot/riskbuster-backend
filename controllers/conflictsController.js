import mongoose from "mongoose";
import { Conflict } from "../models/Conflict.js";

const CONFLICT_TYPES = new Set(["high", "low", "medium", "critical"]);

function serializeConflict(doc) {
  const row = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(row._id),
    title: row.title,
    description: row.description,
    country: row.country,
    status: row.status,
    conflictType: row.conflictType,
    date: row.date,
  };
}

export async function listConflicts(req, res) {
  try {
    const country = req.query.country;
    const query = {};

    if (country && country !== "all" && String(country).toLowerCase() !== "all countries") {
      const c = String(country).trim();
      if (c) query.country = { $regex: c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    }

    const docs = await Conflict.find(query).sort({ date: -1, createdAt: -1 }).exec();
    res.json(docs.map((d) => serializeConflict(d)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load conflicts" });
  }
}

export async function createConflict(req, res) {
  try {
    const { title, description, country, status, date, conflictType } = req.body || {};
    if (!title || !description || !country || !status || !date || !conflictType) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const ct = String(conflictType).toLowerCase().trim();
    if (!CONFLICT_TYPES.has(ct)) {
      return res.status(400).json({ error: "Invalid conflictType" });
    }

    const doc = await Conflict.create({
      title: String(title).trim(),
      description: String(description).trim(),
      country: String(country).trim(),
      status: status === "Outdated" ? "Outdated" : "Active",
      conflictType: ct,
      date: String(date).slice(0, 10),
    });

    res.status(201).json(serializeConflict(doc));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create conflict" });
  }
}

export async function updateConflict(req, res) {
  try {
    const { id } = req.params;
    const { title, description, country, status, date, conflictType } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid conflict id" });
    }
    if (!title || !description || !country || !status || !date || !conflictType) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const ct = String(conflictType).toLowerCase().trim();
    if (!CONFLICT_TYPES.has(ct)) {
      return res.status(400).json({ error: "Invalid conflictType" });
    }

    const doc = await Conflict.findById(id);
    if (!doc) return res.status(404).json({ error: "Not found" });

    doc.title = String(title).trim();
    doc.description = String(description).trim();
    doc.country = String(country).trim();
    doc.status = status === "Outdated" ? "Outdated" : "Active";
    doc.conflictType = ct;
    doc.date = String(date).slice(0, 10);
    await doc.save();

    res.json(serializeConflict(doc));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update conflict" });
  }
}

export async function deleteConflict(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid conflict id" });
    }

    const result = await Conflict.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete conflict" });
  }
}

