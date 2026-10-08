import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { upload } from "../middlewares/upload";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";

const router = Router();

// Public routes
router.get("/products/search", getProducts);
router.get("/products", getProducts);
router.get("/products/:id", getProductById);

// Protected routes (JWT required)
router.post("/products", authenticate, upload.single("image"), createProduct);
router.put("/products/:id", authenticate, updateProduct);
router.delete("/products/:id", authenticate, deleteProduct);

export default router;
