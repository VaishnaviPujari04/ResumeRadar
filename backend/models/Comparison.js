import mongoose from "mongoose";

const comparisonSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobDescription: { type: String, required: true },
    resumeA: {
      filename: String,
      resumeText: String,
      result: {
        matchScore: Number,
        missingKeywords: [String],
        strengths: [String],
        suggestions: [String],
      },
    },
    resumeB: {
      filename: String,
      resumeText: String,
      result: {
        matchScore: Number,
        missingKeywords: [String],
        strengths: [String],
        suggestions: [String],
      },
    },
    winner: { type: String, enum: ["A", "B", "tie"] },
  },
  { timestamps: true }
);

export default mongoose.model("Comparison", comparisonSchema);