import mongoose from "mongoose";

const mentorshipRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

mentorshipRequestSchema.index({ studentId: 1, alumniId: 1, requestedAt: -1 });
mentorshipRequestSchema.index({ alumniId: 1, status: 1, requestedAt: -1 });

const MentorshipRequest = mongoose.model("MentorshipRequest", mentorshipRequestSchema);

export default MentorshipRequest;
