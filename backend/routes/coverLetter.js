import express from "express";
import {
  generateCoverLetter,
  getCoverLetterHistory,
  getCoverLetterById,
} from "../controllers/coverLetterController.js";
import { protect } from "../middleware/auth.js";
import rateLimit from "express-rate-limit";
const router = express.Router();

// Rate limiter for AI-heavy routes — 20 requests per 15 min per IP
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many AI requests. Please try again in a few minutes." },
});

router.post("/generate", protect, generateCoverLetter);
router.get("/history", protect, getCoverLetterHistory);
router.get("/:id", protect, getCoverLetterById);

export default router;