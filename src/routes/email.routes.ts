import { Router } from "express";
import { sendContactMessage } from "../controllers/email.controller";

const router = Router();

router.post("/send", sendContactMessage);

export default router;
