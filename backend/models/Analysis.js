import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobDescription: { type: String, required: true },
    resumeText: { type: String, required: true },
    result: {
      matchScore: Number,
      missingKeywords: [String],
      strengths: [String],
      suggestions: [String],
    },
    // Share fields
    isShared: { type: Boolean, default: false },
    shareId: { type: String, default: null, unique: true, sparse: true },
    sharedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Analysis", analysisSchema);