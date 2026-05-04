import "dotenv/config";

export const PORT = Number(process.env.PORT) || 3001;
export const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@riskbusters.com";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "demo123";
export const MONGODB_URI = process.env.MONGODB_URI;

