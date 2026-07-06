import express from "express";
import { simulateAts } from "../controllers/atsController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/simulate", protect, simulateAts);

export default router;