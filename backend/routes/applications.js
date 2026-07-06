import express from "express";
import {
  addApplication,
  getApplications,
  updateApplication,
  deleteApplication,
  getApplicationStats,
} from "../controllers/applicationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, addApplication);
router.get("/", protect, getApplications);
router.get("/stats", protect, getApplicationStats);
router.patch("/:id", protect, updateApplication);
router.delete("/:id", protect, deleteApplication);

export default router;