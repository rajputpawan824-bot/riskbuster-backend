import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET } from "../config/env.js";

function issueToken(email, role) {
  return jwt.sign({ sub: email, role }, JWT_SECRET, { expiresIn: "7d" });
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || typeof stored !== "string" || !stored.includes(":")) return false;
  const [salt] = stored.split(":", 1);
  return hashPassword(password, salt) === stored;
}

export function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const adminOk =
    normalizedEmail === String(ADMIN_EMAIL).toLowerCase() &&
    password === ADMIN_PASSWORD;

  if (adminOk) {
    const token = issueToken(normalizedEmail, "admin");
    return res.json({ token, user: { email: normalizedEmail, role: "admin" } });
  }

  User.findOne({ email: normalizedEmail })
    .then((user) => {
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const token = issueToken(user.email, "user");
      return res.json({
        token,
        user: {
          email: user.email,
          role: "user",
          name: user.name,
        },
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: "Login failed" });
    });
}

export async function register(req, res) {
  try {
    const { name, email, password, country } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (normalizedEmail === String(ADMIN_EMAIL).toLowerCase()) {
      return res.status(409).json({ error: "This email is reserved for admin sign-in" });
    }

    const existing = await User.findOne({ email: normalizedEmail }).exec();
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      country: country != null ? String(country).trim() : "",
    });

    const token = issueToken(user.email, "user");
    res.status(201).json({
      token,
      user: {
        email: user.email,
        name: user.name,
        role: "user",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
}

export async function listUsers(req, res) {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
    const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).exec();
    res.json(users.map(u => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      country: u.country || "",
      download_document: u.download_document || [],
      createdAt: u.createdAt,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list users" });
  }
}
