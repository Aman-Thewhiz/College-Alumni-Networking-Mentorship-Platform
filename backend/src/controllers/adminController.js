import mongoose from "mongoose";
import MentorshipRequest from "../models/MentorshipRequest.js";
import Message from "../models/Message.js";
import Opportunity from "../models/Opportunity.js";
import User from "../models/User.js";

const ALLOWED_ROLE_FILTERS = ["Student", "Alumni", "Admin"];
const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAdminUsers = async (req, res, next) => {
  try {
    const requestedRole = String(req.query.role || "").trim();
    const searchQuery = String(req.query.search || "").trim();

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const requestedLimit = Number.parseInt(req.query.limit, 10) || 12;
    const limit = Math.max(1, Math.min(requestedLimit, 50));
    const skip = (page - 1) * limit;

    const query = {};

    if (ALLOWED_ROLE_FILTERS.includes(requestedRole)) {
      query.role = requestedRole;
    }

    if (searchQuery) {
      const keywordRegex = new RegExp(escapeRegex(searchQuery), "i");
      query.$or = [{ name: keywordRegex }, { email: keywordRegex }];
    }

    const [users, total] = await Promise.all([
      User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserByAdmin = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "A valid user id is required",
      });
    }

    const targetUser = await User.findById(targetUserId).select("name role");

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (targetUser.role === "Admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be deleted",
      });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const [mentorshipDeleteResult, messageDeleteResult, opportunityDeleteResult] = await Promise.all([
      MentorshipRequest.deleteMany({
        $or: [{ studentId: targetUserId }, { alumniId: targetUserId }],
      }),
      Message.deleteMany({
        $or: [{ senderId: targetUserId }, { receiverId: targetUserId }],
      }),
      Opportunity.deleteMany({ postedBy: targetUserId }),
    ]);

    await User.findByIdAndDelete(targetUserId);

    res.status(200).json({
      success: true,
      message: "User and associated data deleted successfully",
      deleted: {
        userId: targetUserId,
        mentorshipRequests: mentorshipDeleteResult.deletedCount || 0,
        messages: messageDeleteResult.deletedCount || 0,
        opportunities: opportunityDeleteResult.deletedCount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStudents, totalAlumni, totalMentorshipRequests, totalAcceptedMentorships, totalOpportunities] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "Student" }),
        User.countDocuments({ role: "Alumni" }),
        MentorshipRequest.countDocuments(),
        MentorshipRequest.countDocuments({ status: "accepted" }),
        Opportunity.countDocuments(),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalAlumni,
        totalMentorshipRequests,
        totalAcceptedMentorships,
        totalOpportunities,
      },
    });
  } catch (error) {
    next(error);
  }
};
