import express from "express";
import { extractJobDescription } from "../controllers/jobController.js";

const router = express.Router();

// POST /api/job/extract
router.post("/extract", extractJobDescription);

export default router;