import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

export const PORT = Number(process.env.PORT) || 3001;
export const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@riskbusters.com";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "demo123";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * MongoDB connection URI selection:
 *  - Production  → local MongoDB  (mongodb://localhost:27017/riskBuster)
 *  - Development → Atlas cloud    (mongodb+srv://...)
 *
 * Setting MONGODB_URI explicitly in .env always overrides this logic.
 */
export const MONGODB_URI =
  process.env.MONGODB_URI ||
  (IS_PRODUCTION
    ? "mongodb://localhost:27017/riskBuster"
    : "mongodb+srv://indiaProject:LEsbp5k9osyQcp6Q@indiaproject.1go0lry.mongodb.net/");
export const CONTACT_RECEIVER_EMAIL = process.env.CONTACT_RECEIVER_EMAIL || "pawanrajput852710@gmail.com";
