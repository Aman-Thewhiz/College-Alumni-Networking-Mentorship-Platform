import mongoose from "mongoose";
import MentorshipRequest from "../models/MentorshipRequest.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const toObjectIdString = (value) => String(value?._id || value || "");

const hasAcceptedMentorship = async (firstUserId, secondUserId) => {
  const acceptedMentorship = await MentorshipRequest.findOne({
    status: "accepted",
    $or: [
      { studentId: firstUserId, alumniId: secondUserId },
      { studentId: secondUserId, alumniId: firstUserId },
    ],
  }).select("_id");

  return Boolean(acceptedMentorship);
};

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  role: user.role,
  profilePhoto: user.profilePhoto || "",
  industry: user.industry || "",
  company: user.company || "",
});

export const getMessagesBetweenUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400);
      throw new Error("A valid userId is required");
    }

    if (currentUserId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot start a conversation with yourself",
      });
    }

    const canExchangeMessages = await hasAcceptedMentorship(currentUserId, userId);

    if (!canExchangeMessages) {
      return res.status(403).json({
        success: false,
        message: "Messaging is available only for accepted mentorship connections",
      });
    }

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
    })
      .sort({ sentAt: 1 })
      .select("senderId receiverId content sentAt");

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { receiverId, content } = req.body;

    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      res.status(400);
      throw new Error("A valid receiverId is required");
    }

    const trimmedContent = String(content || "").trim();

    if (!trimmedContent) {
      res.status(400);
      throw new Error("Message content is required");
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself",
      });
    }

    const recipient = await User.findById(receiverId).select("_id role");

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found",
      });
    }

    if (![
      "Student",
      "Alumni",
    ].includes(recipient.role)) {
      return res.status(403).json({
        success: false,
        message: "Messaging is not available for this recipient",
      });
    }

    const canExchangeMessages = await hasAcceptedMentorship(senderId, receiverId);

    if (!canExchangeMessages) {
      return res.status(403).json({
        success: false,
        message: "Messaging is available only for accepted mentorship connections",
      });
    }

    const sentMessage = await Message.create({
      senderId,
      receiverId,
      content: trimmedContent,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      sentMessage,
    });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    const acceptedMentorships = await MentorshipRequest.find({
      status: "accepted",
      $or: [{ studentId: currentUserId }, { alumniId: currentUserId }],
    })
      .populate("studentId", "name role profilePhoto industry company")
      .populate("alumniId", "name role profilePhoto industry company")
      .select("studentId alumniId");

    const connectedUsersById = new Map();

    acceptedMentorships.forEach((mentorship) => {
      const studentId = toObjectIdString(mentorship.studentId?._id);
      const alumniId = toObjectIdString(mentorship.alumniId?._id);
      const currentId = toObjectIdString(currentUserId);

      const connectedUser = studentId === currentId ? mentorship.alumniId : mentorship.studentId;
      const connectedId = toObjectIdString(connectedUser?._id);

      if (connectedId) {
        connectedUsersById.set(connectedId, connectedUser);
      }
    });

    if (connectedUsersById.size === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        conversations: [],
      });
    }

    const connectedObjectIds = Array.from(connectedUsersById.keys()).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const recentMessages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: { $in: connectedObjectIds } },
        { receiverId: currentUserId, senderId: { $in: connectedObjectIds } },
      ],
    })
      .sort({ sentAt: -1 })
      .select("senderId receiverId content sentAt")
      .lean();

    const latestMessageByUserId = new Map();

    recentMessages.forEach((message) => {
      const senderId = toObjectIdString(message.senderId);
      const receiverId = toObjectIdString(message.receiverId);
      const counterpartId = senderId === toObjectIdString(currentUserId) ? receiverId : senderId;

      if (!latestMessageByUserId.has(counterpartId)) {
        latestMessageByUserId.set(counterpartId, message);
      }
    });

    const conversations = Array.from(connectedUsersById.entries())
      .map(([connectedId, connectedUser]) => {
        const latestMessage = latestMessageByUserId.get(connectedId);

        return {
          user: serializeUser(connectedUser),
          latestMessagePreview: latestMessage?.content || "",
          latestMessageAt: latestMessage?.sentAt || null,
          latestSenderId: latestMessage?.senderId || null,
        };
      })
      .sort((firstConversation, secondConversation) => {
        const firstTimestamp = firstConversation.latestMessageAt
          ? new Date(firstConversation.latestMessageAt).getTime()
          : 0;
        const secondTimestamp = secondConversation.latestMessageAt
          ? new Date(secondConversation.latestMessageAt).getTime()
          : 0;

        if (secondTimestamp !== firstTimestamp) {
          return secondTimestamp - firstTimestamp;
        }

        return (firstConversation.user.name || "").localeCompare(secondConversation.user.name || "");
      });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};
