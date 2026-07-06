import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    status: {
      type: String,
      enum: ["Applied", "In Review", "Interview", "Offer", "Rejected"],
      default: "Applied",
    },
    jobUrl: { type: String, default: "" },
    notes: { type: String, default: "" },
    appliedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);