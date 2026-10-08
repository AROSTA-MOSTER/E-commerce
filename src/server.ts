import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import emailRoutes from "./routes/email.routes";
import productRoutes from "./routes/product.routes";
import { connectDB } from "./config/database";

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 3000;

// ─── Core Middleware ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Static Frontend Serving ──────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../fronttt"), { index: false }));

// ─── Swagger API Docs ─────────────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Root & Health Check ──────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.get("/", (req, res) => {
  // If a browser is visiting root, serve the index.html page
  if (req.accepts("html") && req.headers.accept?.includes("text/html")) {
    return res.sendFile(path.join(__dirname, "../fronttt/index.html"));
  }
  // Otherwise return JSON health response for automated clients & tests
  res.json({ message: "E-Commerce API is running" });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/email", emailRoutes);
app.use("/api", productRoutes);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`Server    → http://localhost:${port}`);
  console.log(`API docs  → http://localhost:${port}/api-docs`);
});

export default app;
