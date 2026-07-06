import express from "express";
import { compareResumes, getComparisonHistory } from "../controllers/comparisonController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Two files — resumeA and resumeB
router.post(
  "/",
  protect,
  upload.fields([
    { name: "resumeA", maxCount: 1 },
    { name: "resumeB", maxCount: 1 },
  ]),
  compareResumes
);

router.get("/history", protect, getComparisonHistory);

export default router;