import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export function authRequired(req, res, next) {
  const h = req.headers.authorization;
  const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      email: payload.sub,
      role: payload.role || "user",
    };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
