import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { KnowledgeArticle } from "../models/KnowledgeArticle.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "..", "uploads");

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

/**
 * Light-weight HTML sanitizer for rich-text descriptions.
 *
 * Strips <script>/<style>/<iframe> blocks, inline event handlers (onclick=…)
 * and `javascript:` URLs. Intended for content authored by authenticated
 * editors via the in-app rich text editor; not a hardened sanitizer.
 */
function sanitizeHtml(input) {
  if (input == null) return "";
  let html = String(input);
  // Drop dangerous tags entirely (open + content + close).
  html = html.replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
  // Drop self-closing variants of the same tags.
  html = html.replace(/<\s*(script|style|iframe|object|embed)[^>]*\/?>/gi, "");
  // Strip inline event handlers like onclick="..." or onload='...'.
  html = html.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "");
  html = html.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "");
  html = html.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "");
  // Block javascript: pseudo-URLs in href / src.
  html = html.replace(/((?:href|src)\s*=\s*['"])\s*javascript:[^'"]*(['"])/gi, "$1#$2");
  return html.trim();
}

function serializeArticle(doc) {
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
    country: row.country || "",
    postedDate: row.postedDate,
    imageLink: row.imageLink || imageLinks[0] || "",
    imageLinks,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listKnowledgeArticles(req, res) {
  try {
    const country = req.query.country;
    const query = { isDeleted: { $ne: true } };
    if (country && country !== "all" && String(country).toLowerCase() !== "all countries") {
      const c = String(country).trim();
      if (c) query.country = { $regex: c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    }
    const docs = await KnowledgeArticle.find(query)
      .sort({ postedDate: -1, createdAt: -1 })
      .exec();
    res.json(docs.map((d) => serializeArticle(d)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load knowledge articles" });
  }
}

export async function getKnowledgeArticle(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid article id" });
    }
    const doc = await KnowledgeArticle.findById(id);
    if (!doc || doc.isDeleted) return res.status(404).json({ error: "Not found" });
    res.json(serializeArticle(doc));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load article" });
  }
}

export async function createKnowledgeArticle(req, res) {
  try {
    const { title, description, country, postedDate } = req.body || {};
    if (!title || !description || !postedDate) {
      return res.status(400).json({ error: "Title, description and posted date are required" });
    }
    const uploadedImages = uploadedImageLinksFromReq(req);

    const doc = await KnowledgeArticle.create({
      title: String(title).trim(),
      description: sanitizeHtml(description),
      country: country != null ? String(country).trim() : "",
      postedDate: String(postedDate).slice(0, 10),
      imageLink: uploadedImages[0] || "",
      imageLinks: uploadedImages,
    });
    res.status(201).json(serializeArticle(doc));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create article" });
  }
}

export async function updateKnowledgeArticle(req, res) {
  try {
    const { id } = req.params;
    const { title, description, country, postedDate } = req.body || {};
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid article id" });
    }
    if (!title || !description || !postedDate) {
      return res.status(400).json({ error: "Title, description and posted date are required" });
    }
    const doc = await KnowledgeArticle.findById(id);
    if (!doc || doc.isDeleted) return res.status(404).json({ error: "Not found" });

    doc.title = String(title).trim();
    doc.description = sanitizeHtml(description);
    doc.country = country != null ? String(country).trim() : "";
    doc.postedDate = String(postedDate).slice(0, 10);

    const uploadedImages = uploadedImageLinksFromReq(req);
    if (uploadedImages.length > 0) {
      const prev = Array.isArray(doc.imageLinks)
        ? doc.imageLinks
        : doc.imageLink
        ? [doc.imageLink]
        : [];
      doc.imageLinks = [...prev, ...uploadedImages];
      doc.imageLink = doc.imageLinks[0] || "";
    }

    await doc.save();
    res.json(serializeArticle(doc));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update article" });
  }
}

export async function deleteKnowledgeArticle(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid article id" });
    }
    const doc = await KnowledgeArticle.findById(id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    await doc.save();
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete article" });
  }
}
