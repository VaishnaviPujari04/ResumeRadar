import express from "express";
import {
  generateQuestions,
  getInterviewHistory,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/generate", protect, generateQuestions);
router.get("/history", protect, getInterviewHistory);

export default router;