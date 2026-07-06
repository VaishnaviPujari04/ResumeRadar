import Analysis from "../models/Analysis.js";
import CoverLetter from "../models/CoverLetter.js";
import Rewrite from "../models/Rewrite.js";
import Application from "../models/Application.js";

export async function getStats(req, res) {
  try {
    const analyses = await Analysis.find({ userId: req.user.id })
      .sort({ createdAt: 1 })
      .select("result.matchScore createdAt");

    const totalAnalyses = analyses.length;
    const avgScore = totalAnalyses > 0
      ? Math.round(analyses.reduce((sum, a) => sum + (a.result?.matchScore || 0), 0) / totalAnalyses)
      : 0;

    const coverLetterCount = await CoverLetter.countDocuments({ userId: req.user.id });
    const rewriteCount = await Rewrite.countDocuments({ userId: req.user.id });

    // Application stats
    const appStats = await Application.aggregate([
      { $match: { userId: req.user.id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const totalApplications = await Application.countDocuments({ userId: req.user.id });

    // Score trend
    const trend = analyses.map((a) => ({
      date: a.createdAt,
      score: a.result?.matchScore || 0,
    }));

    // Weekly analyses — last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyAnalyses = analyses.filter(
      (a) => new Date(a.createdAt) >= weekAgo
    ).length;

    // Top missing keywords
    const allAnalyses = await Analysis.find({ userId: req.user.id })
      .select("result.missingKeywords");
    const keywordCount = {};
    allAnalyses.forEach((a) => {
      (a.result?.missingKeywords || []).forEach((kw) => {
        keywordCount[kw] = (keywordCount[kw] || 0) + 1;
      });
    });
    const topMissingKeywords = Object.entries(keywordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([keyword, count]) => ({ keyword, count }));

    res.json({
      totalAnalyses,
      avgScore,
      coverLetterCount,
      rewriteCount,
      totalApplications,
      weeklyAnalyses,
      appStats,
      trend,
      topMissingKeywords,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
}