import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Opportunity title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Opportunity description is required"],
      trim: true,
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["job", "internship"],
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

opportunitySchema.index({ createdAt: -1 });
opportunitySchema.index({ type: 1, createdAt: -1 });
opportunitySchema.index({ postedBy: 1, createdAt: -1 });

const Opportunity = mongoose.model("Opportunity", opportunitySchema);

export default Opportunity;
