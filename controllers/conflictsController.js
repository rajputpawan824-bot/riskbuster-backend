import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { Conflict } from "../models/Conflict.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "..", "uploads");

const CONFLICT_TYPES = new Set(["high", "low", "medium", "critical"]);
const IMPACTS = new Set(["local", "regional", "global"]);

function uploadedImageLinksFromReq(req) {
  /** @type {Array<{path: string}>} */
  const items = [];
  if (req?.file?.path) items.push(req.file);
  const rf = req?.files;
  if (rf && typeof rf === "object") {
    for (const v of Object.values(rf)) {
      if (Array.isArray(v)) items.push(...v);
    }
  }
  return items
    .filter((f) => f && typeof f.path === "string")
    .map((f) => `/uploads/${path.relative(uploadsDir, f.path).replaceAll("\\", "/")}`);
}

function serializeConflict(doc) {
  const row = doc.toObject ? doc.toObject() : doc;
  const imageLinks = Array.isArray(row.imageLinks)
    ? row.imageLinks
    : row.imageLink
    ? [row.imageLink]
    : [];
  return {
    id: String(row._id),
    title: row.title,
    description: row.description,
    country: row.country,
    status: row.status,
    conflictType: row.conflictType,
    impact: row.impact || null,
    date: row.date,
    imageLink: row.imageLink || imageLinks[0] || "",
    imageLinks,
  };
}

export async function listConflicts(req, res) {
  try {
    const country = req.query.country;
    const query = { isDeleted: { $ne: true } };

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

export async function getConflict(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid conflict id" });
    }
    const doc = await Conflict.findById(id);
    if (!doc || doc.isDeleted) return res.status(404).json({ error: "Not found" });
    res.json(serializeConflict(doc));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load conflict" });
  }
}

export async function createConflict(req, res) {
  try {
    const { title, description, country, status, date, conflictType, impact } = req.body || {};
    if (!title || !description || !country || !status || !date || !conflictType) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const ct = String(conflictType).toLowerCase().trim();
    if (!CONFLICT_TYPES.has(ct)) {
      return res.status(400).json({ error: "Invalid conflictType" });
    }
    let imp = null;
    if (impact != null && String(impact).trim() !== "") {
      const i = String(impact).toLowerCase().trim();
      if (!IMPACTS.has(i)) {
        return res.status(400).json({ error: "Invalid impact" });
      }
      imp = i;
    }

    const uploadedImages = uploadedImageLinksFromReq(req);

    const doc = await Conflict.create({
      title: String(title).trim(),
      description: String(description).trim(),
      country: String(country).trim(),
      status: status === "Outdated" ? "Outdated" : "Active",
      conflictType: ct,
      impact: imp,
      date: String(date).slice(0, 10),
      imageLink: uploadedImages[0] || "",
      imageLinks: uploadedImages,
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
    const { title, description, country, status, date, conflictType, impact } = req.body || {};

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
    let imp = null;
    if (impact != null && String(impact).trim() !== "") {
      const i = String(impact).toLowerCase().trim();
      if (!IMPACTS.has(i)) {
        return res.status(400).json({ error: "Invalid impact" });
      }
      imp = i;
    }

    const doc = await Conflict.findById(id);
    if (!doc) return res.status(404).json({ error: "Not found" });

    doc.title = String(title).trim();
    doc.description = String(description).trim();
    doc.country = String(country).trim();
    doc.status = status === "Outdated" ? "Outdated" : "Active";
    doc.conflictType = ct;
    doc.impact = imp;
    doc.date = String(date).slice(0, 10);

    const uploadedImages = uploadedImageLinksFromReq(req);
    if (uploadedImages.length > 0) {
      // Append new uploads; keep previous images intact.
      const prev = Array.isArray(doc.imageLinks)
        ? doc.imageLinks
        : doc.imageLink
        ? [doc.imageLink]
        : [];
      doc.imageLinks = [...prev, ...uploadedImages];
      doc.imageLink = doc.imageLinks[0] || "";
    }

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

    const doc = await Conflict.findById(id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    await doc.save();
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete conflict" });
  }
}
