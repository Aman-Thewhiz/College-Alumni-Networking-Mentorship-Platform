import mongoose from "mongoose";
import MentorshipRequest from "../models/MentorshipRequest.js";
import User from "../models/User.js";

const MENTORSHIP_ALLOWED_STATUS = ["accepted", "rejected"];

export const createMentorshipRequest = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { alumniId, message } = req.body;

    if (!alumniId || !mongoose.Types.ObjectId.isValid(alumniId)) {
      res.status(400);
      throw new Error("A valid alumniId is required");
    }

    if (!message || !String(message).trim()) {
      res.status(400);
      throw new Error("A mentorship message is required");
    }

    if (studentId.toString() === alumniId) {
      res.status(400);
      throw new Error("You cannot send a mentorship request to yourself");
    }

    const alumni = await User.findById(alumniId).select("name role");

    if (!alumni || alumni.role !== "Alumni") {
      res.status(400);
      throw new Error("Mentorship requests can only be sent to alumni users");
    }

    const existingRequest = await MentorshipRequest.findOne({
      studentId,
      alumniId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingRequest) {
      const duplicateMessage =
        existingRequest.status === "accepted"
          ? "You already have an accepted mentorship with this alumni"
          : "You already have a pending mentorship request for this alumni";

      return res.status(400).json({
        success: false,
        message: duplicateMessage,
      });
    }

    const mentorshipRequest = await MentorshipRequest.create({
      studentId,
      alumniId,
      message: String(message).trim(),
    });

    const populatedRequest = await MentorshipRequest.findById(mentorshipRequest._id)
      .populate("alumniId", "name role profilePhoto industry company skills")
      .populate("studentId", "name role profilePhoto industry skills");

    res.status(201).json({
      success: true,
      message: "Mentorship request sent successfully",
      request: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const getSentMentorshipRequests = async (req, res, next) => {
  try {
    const requests = await MentorshipRequest.find({ studentId: req.user._id })
      .sort({ requestedAt: -1 })
      .populate("alumniId", "name role profilePhoto industry company skills graduationYear")
      .select("studentId alumniId message status requestedAt");

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const getReceivedMentorshipRequests = async (req, res, next) => {
  try {
    const requests = await MentorshipRequest.find({ alumniId: req.user._id })
      .sort({ requestedAt: -1 })
      .populate("studentId", "name role profilePhoto industry skills graduationYear")
      .select("studentId alumniId message status requestedAt");

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMentorshipRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!MENTORSHIP_ALLOWED_STATUS.includes(status)) {
      res.status(400);
      throw new Error("Status must be either accepted or rejected");
    }

    const mentorshipRequest = await MentorshipRequest.findById(req.params.id);

    if (!mentorshipRequest) {
      return res.status(404).json({
        success: false,
        message: "Mentorship request not found",
      });
    }

    if (mentorshipRequest.alumniId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update mentorship requests sent to you",
      });
    }

    mentorshipRequest.status = status;
    await mentorshipRequest.save();

    const populatedRequest = await MentorshipRequest.findById(mentorshipRequest._id)
      .populate("studentId", "name role profilePhoto industry skills graduationYear")
      .populate("alumniId", "name role profilePhoto industry company skills");

    res.status(200).json({
      success: true,
      message: `Mentorship request ${status}`,
      request: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
};
