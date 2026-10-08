import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/user.model";
import { signToken } from "../utils/jwt";
import { sendResetCodeEmail, sendWelcomeEmail } from "../services/email.service";

const hashCode = (code: string) =>
  crypto.createHash("sha256").update(code).digest("hex");

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ message: "Email already in use" });
  }

  // role is never taken from the request body — no one can self-register as admin
  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
  });

  try {
    await sendWelcomeEmail(email, name);
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }

  res.status(201).json({
    token: signToken({ id: user.id }),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    token: signToken({ id: user.id }),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
};

// GET /api/auth/profile  (requires authenticate middleware)
export const profile = async (req: Request, res: Response) => {
  res.json({ user: req.user });
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Always return the same message to prevent account enumeration
  const message = "If that email is registered, a reset code has been sent";

  const user = await User.findOne({ email });
  if (!user) return res.json({ message });

  const code = crypto.randomInt(100_000, 1_000_000).toString();
  user.resetCode = hashCode(code);
  user.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  user.resetCodeAttempts = 0;
  await user.save();

  try {
    await sendResetCodeEmail(email, code);
  } catch (error) {
    console.error("Failed to send reset email:", error);
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    user.resetCodeAttempts = undefined;
    await user.save();
    return res.status(500).json({ message: "Could not send reset email, try again later" });
  }

  res.json({ message });
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: "Email, code and newPassword are required" });
  }

  const user = await User.findOne({ email }).select(
    "+resetCode +resetCodeExpires +resetCodeAttempts"
  );

  if (!user || !user.resetCode || !user.resetCodeExpires) {
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  if (user.resetCodeExpires < new Date()) {
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    user.resetCodeAttempts = undefined;
    await user.save();
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  const hashedProvided = hashCode(String(code));
  if (user.resetCode !== hashedProvided) {
    const attempts = (user.resetCodeAttempts || 0) + 1;
    if (attempts >= 5) {
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
      user.resetCodeAttempts = undefined;
      await user.save();
      return res.status(400).json({
        message:
          "Too many failed attempts. Reset code has been invalidated. Please request a new one.",
      });
    }
    user.resetCodeAttempts = attempts;
    await user.save();
    return res.status(400).json({
      message: `Invalid code. ${5 - attempts} attempt(s) remaining.`,
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetCode = undefined;
  user.resetCodeExpires = undefined;
  user.resetCodeAttempts = undefined;
  await user.save();

  res.json({ message: "Password reset successful, you can now log in" });
};
