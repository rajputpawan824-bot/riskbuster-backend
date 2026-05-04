import mongoose from "mongoose";
import { Category } from "../models/Category.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "..", "uploads");

async function tryDeleteUploadedFile(fileLink) {
  if (!fileLink || typeof fileLink !== "string") return;
  if (!fileLink.startsWith("/uploads/")) return;
  const rel = fileLink.slice("/uploads/".length).replaceAll("\\", "/");
  if (!rel || rel.includes("\0") || rel.includes("..")) return;
  const abs = path.resolve(uploadsDir, rel);
  const base = uploadsDir.endsWith(path.sep) ? uploadsDir : uploadsDir + path.sep;
  if (!abs.startsWith(base)) return;
  try {
    await fs.unlink(abs);
  } catch {
    // ignore
  }
}

/** @param {import("mongoose").Document} doc */
function serializeCategory(doc) {
  const row = doc.toObject ? doc.toObject() : doc;
  let parentId = null;
  let parentTitle = null;
  const p = row.parent;
  if (p) {
    if (typeof p === "object" && p._id != null && "title" in p) {
      parentId = String(p._id);
      parentTitle = typeof p.title === "string" ? p.title : null;
    } else {
      parentId = String(p);
    }
  }
  return {
    id: String(row._id),
    title: row.title,
    creditTo: row.creditTo,
    description: row.description,
    fileLink: row.fileLink || "",
    parentId,
    parentTitle,
  };
}

async function resolveParentOrError(rawParentId) {
  if (rawParentId == null || String(rawParentId).trim() === "") {
    return { parent: null };
  }
  const id = String(rawParentId).trim();
  if (!mongoose.isValidObjectId(id)) {
    return { error: "Invalid parent category id" };
  }
  const p = await Category.findById(id).lean();
  if (!p) return { error: "Parent category not found" };
  if (p.parent) {
    return { error: "Parent must be a top-level category (not a subcategory)" };
  }
  return { parent: p._id };
}

async function countChildren(categoryId) {
  return Category.countDocuments({ parent: categoryId });
}

export async function listCategories(_req, res) {
  try {
    const docs = await Category.find()
      .populate("parent", "title")
      .sort({ parent: 1, title: 1 })
      .exec();
    res.json(docs.map((d) => serializeCategory(d)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load categories" });
  }
}

export async function createCategory(req, res) {
  const { title, creditTo, description, fileLink, parentId } = req.body || {};
  if (!title || !creditTo || !description) {
    return res.status(400).json({ error: "Title, credit, and description are required" });
  }
  const resolved = await resolveParentOrError(parentId);
  if (resolved.error) {
    return res.status(400).json({ error: resolved.error });
  }
  try {
    const uploadedLink = req.file
      ? `/uploads/${path.relative(uploadsDir, req.file.path).replaceAll("\\", "/")}`
      : null;
    const doc = await Category.create({
      title: String(title).trim(),
      creditTo: String(creditTo).trim(),
      description: String(description).trim(),
      fileLink: uploadedLink ?? (fileLink != null ? String(fileLink).trim() : ""),
      parent: resolved.parent,
    });
    const populated = await Category.findById(doc._id).populate("parent", "title").exec();
    res.status(201).json(serializeCategory(populated));
  } catch (e) {
    if (e && e.code === 11000) {
      return res
        .status(409)
        .json({ error: "A category with this title already exists under the same parent" });
    }
    console.error(e);
    res.status(500).json({ error: "Failed to create category" });
  }
}

export async function updateCategory(req, res) {
  const { id } = req.params;
  const { title, creditTo, description, fileLink, parentId } = req.body || {};
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid category id" });
  }
  if (!title || !creditTo || !description) {
    return res.status(400).json({ error: "Title, credit, and description are required" });
  }
  const doc = await Category.findById(id);
  if (!doc) return res.status(404).json({ error: "Not found" });

  const resolved = await resolveParentOrError(parentId);
  if (resolved.error) {
    return res.status(400).json({ error: resolved.error });
  }
  if (resolved.parent && String(resolved.parent) === String(doc._id)) {
    return res.status(400).json({ error: "A category cannot be its own parent" });
  }
  if (resolved.parent) {
    const kids = await countChildren(doc._id);
    if (kids > 0) {
      return res.status(400).json({
        error:
          "This category has subcategories. Remove or reassign them before making it a subcategory.",
      });
    }
  }

  doc.title = String(title).trim();
  doc.creditTo = String(creditTo).trim();
  doc.description = String(description).trim();
  const uploadedLink = req.file
    ? `/uploads/${path.relative(uploadsDir, req.file.path).replaceAll("\\", "/")}`
    : null;
  if (uploadedLink) {
    const prev = doc.fileLink;
    doc.fileLink = uploadedLink;
    await tryDeleteUploadedFile(prev);
  } else {
    doc.fileLink = fileLink != null ? String(fileLink).trim() : "";
  }
  doc.parent = resolved.parent;
  try {
    await doc.save();
    const populated = await Category.findById(doc._id).populate("parent", "title").exec();
    res.json(serializeCategory(populated));
  } catch (e) {
    if (e && e.code === 11000) {
      return res
        .status(409)
        .json({ error: "A category with this title already exists under the same parent" });
    }
    console.error(e);
    res.status(500).json({ error: "Failed to update category" });
  }
}

export async function deleteCategory(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid category id" });
  }
  const kids = await countChildren(id);
  if (kids > 0) {
    return res.status(400).json({ error: "Cannot delete a category that has subcategories" });
  }
  const result = await Category.findByIdAndDelete(id);
  if (!result) return res.status(404).json({ error: "Not found" });
  res.status(204).end();
}

