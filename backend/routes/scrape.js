import express from "express";
import { scrapeJobDescription } from "../controllers/scrapeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, scrapeJobDescription);

export default router;