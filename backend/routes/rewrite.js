import express from "express";
import {
  rewriteBullet,
  rewriteFullResume,
  getRewriteHistory,
} from "../controllers/rewriteController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/bullet", protect, rewriteBullet);
router.post("/resume", protect, rewriteFullResume);
router.get("/history", protect, getRewriteHistory);

export default router;