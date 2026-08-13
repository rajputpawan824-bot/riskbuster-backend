import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET, FRONTEND_URL } from "../config/env.js";
import { sendPasswordResetEmail } from "../services/emailService.js";

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

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body || {};
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (normalizedEmail === String(ADMIN_EMAIL).toLowerCase()) {
      return res.json({
        message:
          "Admin password is managed via system configuration. Please contact system administration if you need to reset admin access.",
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).exec();
    if (!user) {
      return res.json({
        message:
          "If an account with that email exists, we have sent password reset instructions.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(
      user.email
    )}`;

    const result = await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetLink,
    });

    if (!result.success) {
      console.error("Failed to send reset email:", result.message);
    }

    return res.json({
      message:
        "If an account with that email exists, we have sent password reset instructions.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to process password reset request" });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, token, newPassword } = req.body || {};
    if (!email || !token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Email, reset token, and new password are required" });
    }

    if (String(newPassword).length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters long" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({
      email: normalizedEmail,
      resetPasswordToken: String(token).trim(),
      resetPasswordExpires: { $gt: new Date() },
    }).exec();

    if (!user) {
      return res
        .status(400)
        .json({ error: "Password reset token is invalid or has expired." });
    }

    user.passwordHash = hashPassword(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: "Password reset successful! You can now log in." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to reset password" });
  }
}

