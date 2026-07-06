import mongoose from "mongoose";

const coverLetterSchema = new mongoose.Schema(
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
    resumeText: { type: String, required: true },
    coverLetter: { type: String, required: true },
    companyName: { type: String, default: "" },
    jobTitle: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("CoverLetter", coverLetterSchema);