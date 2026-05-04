import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "..", "uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

function slugifyFolderName(input) {
  const raw = typeof input === "string" ? input : "";
  const slug = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);
  return slug || "untitled";
}

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    try {
      ensureUploadsDir();
      const title = req?.body?.title;
      const folder = slugifyFolderName(title);
      const dest = path.join(uploadsDir, folder);
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    } catch (e) {
      cb(e, uploadsDir);
    }
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || "");
    const safeExt = ext.length <= 10 ? ext : "";
    const base = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    cb(null, `${base}${safeExt}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
});

