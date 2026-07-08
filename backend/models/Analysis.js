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
    isShared: { type: Boolean, default: false },
    shareId: { type: String, default: null }, // NO unique, NO sparse
    sharedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Only add index if shareId is not null
analysisSchema.index(
  { shareId: 1 },
  { unique: true, sparse: true, partialFilterExpression: { shareId: { $type: "string" } } }
);

export default mongoose.model("Analysis", analysisSchema);