import mongoose from "mongoose";

const rewriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["bullet", "full_resume"],
      required: true,
    },
    original: { type: String, required: true },
    rewritten: { type: String, required: true },
    jobDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Rewrite", rewriteSchema);