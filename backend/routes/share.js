import express from "express";
import {
  generateShareLink,
  revokeShareLink,
  getSharedReport,
} from "../controllers/shareController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Protected — only owner can generate/revoke
router.post("/:analysisId", protect, generateShareLink);
router.delete("/:analysisId", protect, revokeShareLink);

// Public — anyone with the shareId can view
router.get("/report/:shareId", getSharedReport);

export default router;