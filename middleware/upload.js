import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "..", "uploads");
const articlesDir = path.join(uploadsDir, "articles");

function ensureUploadsDir() {
  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true });
  }
}

function sanitizeOriginalFilename(originalName) {
  const name = path.basename(String(originalName || "")).replace(/[^a-zA-Z0-9._-]/g, "-");
  return name.slice(0, 120);
}

function fileFilter(_req, file, cb) {
  const allowed = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
    ".svg",
  ];
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error("Unsupported file type"));
  }
  cb(null, true);
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    try {
      ensureUploadsDir();
      cb(null, articlesDir);
    } catch (e) {
      cb(e, uploadsDir);
    }
  },
  filename(_req, file, cb) {
    const original = sanitizeOriginalFilename(file.originalname);
    try {
      // Prefer storing the file using the original filename.
      // If a file with the same name already exists, append a numeric suffix
      // (file-1.ext, file-2.ext, ...) to avoid overwriting existing uploads.
      const ext = path.extname(original);
      const base = path.basename(original, ext);
      let candidate = original;
      let counter = 0;
      while (fs.existsSync(path.join(articlesDir, candidate))) {
        counter += 1;
        candidate = `${base}-${counter}${ext}`;
        if (counter > 1000) {
          // Fallback to a randomized name if loops unexpectedly.
          candidate = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
          break;
        }
      }
      cb(null, candidate);
    } catch (e) {
      // In case of any filesystem error, fall back to a timestamped safe name.
      const uuid = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
      const filename = `${Date.now()}-${uuid}-${original}`;
      cb(null, filename);
    }
  },
});

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

