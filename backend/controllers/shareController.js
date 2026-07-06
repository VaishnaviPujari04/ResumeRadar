import crypto from "crypto";
import Analysis from "../models/Analysis.js";

// POST /api/share/:analysisId — generate share link
export async function generateShareLink(req, res) {
  const { analysisId } = req.params;

  try {
    const analysis = await Analysis.findOne({
      _id: analysisId,
      userId: req.user.id,
    });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    // If already shared, return existing link
    if (analysis.isShared && analysis.shareId) {
      return res.json({
        message: "Share link already exists",
        shareId: analysis.shareId,
        shareUrl: `/report/${analysis.shareId}`,
      });
    }

    // Generate unique share ID
    const shareId = crypto.randomBytes(8).toString("hex"); // e.g. "a3f9c2d1e4b5f6a7"

    analysis.isShared = true;
    analysis.shareId = shareId;
    analysis.sharedAt = new Date();
    await analysis.save();

    res.json({
      message: "Share link generated",
      shareId,
      shareUrl: `/report/${shareId}`,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate share link", error: err.message });
  }
}

// DELETE /api/share/:analysisId — revoke share link
export async function revokeShareLink(req, res) {
  const { analysisId } = req.params;

  try {
    const analysis = await Analysis.findOne({
      _id: analysisId,
      userId: req.user.id,
    });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    analysis.isShared = false;
    analysis.shareId = null;
    analysis.sharedAt = null;
    await analysis.save();

    res.json({ message: "Share link revoked" });
  } catch (err) {
    res.status(500).json({ message: "Failed to revoke share link", error: err.message });
  }
}

// GET /api/report/:shareId — public, no auth needed
export async function getSharedReport(req, res) {
  const { shareId } = req.params;

  try {
    const analysis = await Analysis.findOne({
      shareId,
      isShared: true,
    }).select("-resumeText -userId"); // never expose resume text or user ID

    if (!analysis) {
      return res.status(404).json({ message: "Report not found or link has been revoked" });
    }

    res.json({
      matchScore: analysis.result?.matchScore,
      missingKeywords: analysis.result?.missingKeywords,
      strengths: analysis.result?.strengths,
      suggestions: analysis.result?.suggestions,
      jobDescription: analysis.jobDescription.slice(0, 300) + "...", // partial JD only
      sharedAt: analysis.sharedAt,
      createdAt: analysis.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch report" });
  }
}