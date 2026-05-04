import jwt from "jsonwebtoken";
import { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET } from "../config/env.js";

export function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const ok =
    String(email).toLowerCase() === String(ADMIN_EMAIL).toLowerCase() &&
    password === ADMIN_PASSWORD;
  if (!ok) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = jwt.sign({ sub: email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { email } });
}

