import mongoose from "mongoose";

const interviewPrepSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Analysis",
      required: true,
    },
    jobDescription: { type: String, required: true },
    questions: [
      {
        question: String,
        category: String, // "Technical", "Behavioral", "Situational"
        tip: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("InterviewPrep", interviewPrepSchema);