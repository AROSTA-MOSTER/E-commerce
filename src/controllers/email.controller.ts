import { Request, Response } from "express";
import { sendContactEmail } from "../services/email.service";

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// POST /api/email/send
export const sendContactMessage = async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof subject !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !isValidEmail(email.trim()) ||
    !subject.trim() ||
    !message.trim()
  ) {
    return res
      .status(400)
      .json({ message: "Name, a valid email, subject, and message are required" });
  }

  if (
    name.length > 100 ||
    email.length > 254 ||
    subject.length > 200 ||
    message.length > 5000
  ) {
    return res.status(400).json({ message: "One or more fields exceed the allowed length" });
  }

  try {
    await sendContactEmail(name.trim(), email.trim(), subject.trim(), message.trim());
    res.status(200).json({ message: "Your message has been sent" });
  } catch (error) {
    console.error("Could not send contact email:", error);
    res.status(503).json({ message: "Email service is unavailable" });
  }
};
