import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { Template } from "../models/Template.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "..", "uploads");

function uploadedLinksFromReq(req) {
  /** @type {Array<{path: string}>} */
  const items = [];
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

function serializeTemplate(doc) {
  const row = doc.toObject ? doc.toObject() : doc;
  const links = Array.isArray(row.fileLinks)
    ? row.fileLinks
    : row.fileLink
      ? [row.fileLink]
      : [];
  return {
    id: String(row._id),
    title: row.title,
    description: row.description,
    fileLink: row.fileLink || "",
    fileLinks: links,
  };
}

export async function listTemplates(_req, res) {
  try {
    const docs = await Template.find({ isDeleted: { $ne: true } }).sort({ title: 1 }).exec();
    res.json(docs.map((d) => serializeTemplate(d)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load templates" });
  }
}

export async function createTemplate(req, res) {
  try {
    const { title, description, fileLink } = req.body || {};
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }
    const uploadedLinks = uploadedLinksFromReq(req);
    const linksFromBody =
      fileLink != null && String(fileLink).trim() ? [String(fileLink).trim()] : [];
    const mergedLinks = [...uploadedLinks, ...linksFromBody];

    const doc = await Template.create({
      title: String(title).trim(),
      description: String(description).trim(),
      fileLink: mergedLinks[0] || "",
      fileLinks: mergedLinks,
    });
    res.status(201).json(serializeTemplate(doc));
  } catch (e) {
    if (e && e.code === 11000) {
      return res.status(409).json({ error: "A template with this title already exists" });
    }
    console.error(e);
    res.status(500).json({ error: "Failed to create template" });
  }
}

export async function updateTemplate(req, res) {
  try {
    const { id } = req.params;
    const { title, description, fileLink } = req.body || {};
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid template id" });
    }
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }
    const doc = await Template.findById(id);
    if (!doc) return res.status(404).json({ error: "Not found" });

    doc.title = String(title).trim();
    doc.description = String(description).trim();

    const uploadedLinks = uploadedLinksFromReq(req);
    if (uploadedLinks.length > 0) {
      const prevLinks = Array.isArray(doc.fileLinks) ? doc.fileLinks : doc.fileLink ? [doc.fileLink] : [];
      doc.fileLinks = [...prevLinks, ...uploadedLinks];
      doc.fileLink = doc.fileLinks[0] || "";
    } else {
      const legacy = fileLink != null ? String(fileLink).trim() : "";
      doc.fileLink = legacy;
      if (!Array.isArray(doc.fileLinks) || doc.fileLinks.length === 0) {
        doc.fileLinks = legacy ? [legacy] : [];
      }
    }

    await doc.save();
    res.json(serializeTemplate(doc));
  } catch (e) {
    if (e && e.code === 11000) {
      return res.status(409).json({ error: "A template with this title already exists" });
    }
    console.error(e);
    res.status(500).json({ error: "Failed to update template" });
  }
}

export async function deleteTemplate(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid template id" });
    }
    const doc = await Template.findById(id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    await doc.save();
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete template" });
  }
}

