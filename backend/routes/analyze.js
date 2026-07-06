import express from "express";
import {
  analyzeResume,
  analyzeResumeFile,
  getHistory,
  getAnalysisById,
} from "../controllers/analyzeController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Rate limiter for AI-heavy routes — 20 requests per 15 min per IP
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many AI requests. Please try again in a few minutes." },
});

router.post("/", protect, aiLimiter, analyzeResume);

router.post("/upload", protect, upload.single("resume"), analyzeResumeFile);
router.get("/history", protect, getHistory);
router.get("/history/:id", protect, getAnalysisById);

export default router;