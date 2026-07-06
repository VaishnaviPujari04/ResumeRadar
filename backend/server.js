import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import analyzeRoutes from "./routes/analyze.js";
import coverLetterRoutes from "./routes/coverLetter.js";
import rewriteRoutes from "./routes/rewrite.js";
import interviewRoutes from "./routes/interview.js";
import statsRoutes from "./routes/stats.js";
import jobRoutes from "./routes/job.js";
import scrapeRoutes from "./routes/scrape.js";
import compareRoutes from "./routes/compare.js";
import shareRoutes from "./routes/share.js";
import applicationRoutes from "./routes/applications.js";
import atsRoutes from "./routes/ats.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/cover-letter", coverLetterRoutes);
app.use("/api/rewrite", rewriteRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/scrape", scrapeRoutes);
app.use("/api/compare", compareRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/ats", atsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "ResumeRadar API running ✅" });
});
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT} ✅`);
    });
  })
  .catch((err) => console.log("DB connection error:", err));