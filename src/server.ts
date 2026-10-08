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

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../fronttt"), { index: false }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.get("/", (req, res) => {
  if (req.accepts("html") && req.headers.accept?.includes("text/html")) {
    return res.sendFile(path.join(__dirname, "../fronttt/index.html"));
  }
  res.json({ message: "E-Commerce API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/email", emailRoutes);
app.use("/api", productRoutes);

app.listen(port, () => {
  console.log(`Server    → http://localhost:${port}`);
  console.log(`API docs  → http://localhost:${port}/api-docs`);
});

export default app;
