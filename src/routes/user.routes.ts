import { Router } from "express";
import { getAllUsers } from "../controllers/user.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

// Admin only: must be authenticated AND have the "admin" role
router.get("/", authenticate, authorize("admin"), getAllUsers);

export default router;
