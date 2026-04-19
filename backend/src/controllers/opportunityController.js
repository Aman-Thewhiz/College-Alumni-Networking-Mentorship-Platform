import mongoose from "mongoose";
import Opportunity from "../models/Opportunity.js";

const ALLOWED_TYPES = ["job", "internship"];
const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getOpportunities = async (req, res, next) => {
  try {
    const typeQuery = String(req.query.type || "").trim().toLowerCase();
    const searchQuery = String(req.query.search || "").trim();
    const postedByQuery = String(req.query.postedBy || "").trim();

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const requestedLimit = Number.parseInt(req.query.limit, 10) || 12;
    const limit = Math.max(1, Math.min(requestedLimit, 50));
    const skip = (page - 1) * limit;

    const query = {};

    if (ALLOWED_TYPES.includes(typeQuery)) {
      query.type = typeQuery;
    }

    if (postedByQuery && mongoose.Types.ObjectId.isValid(postedByQuery)) {
      query.postedBy = postedByQuery;
    }

    if (searchQuery) {
      const searchRegex = new RegExp(escapeRegex(searchQuery), "i");
      query.$or = [{ title: searchRegex }, { company: searchRegex }, { description: searchRegex }];
    }

    const [opportunities, total] = await Promise.all([
      Opportunity.find(query)
        .populate("postedBy", "name role profilePhoto industry company")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Opportunity.countDocuments(query),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.status(200).json({
      success: true,
      count: opportunities.length,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      opportunities,
    });
  } catch (error) {
    next(error);
  }
};

export const createOpportunity = async (req, res, next) => {
  try {
    const title = String(req.body.title || "").trim();
    const company = String(req.body.company || "").trim();
    const description = String(req.body.description || "").trim();
    const type = String(req.body.type || "").trim().toLowerCase();

    if (!title) {
      res.status(400);
      throw new Error("Opportunity title is required");
    }

    if (!company) {
      res.status(400);
      throw new Error("Company is required");
    }

    if (!description) {
      res.status(400);
      throw new Error("Opportunity description is required");
    }

    if (!ALLOWED_TYPES.includes(type)) {
      res.status(400);
      throw new Error("Type must be either job or internship");
    }

    const opportunity = await Opportunity.create({
      title,
      company,
      description,
      type,
      postedBy: req.user._id,
    });

    const populatedOpportunity = await Opportunity.findById(opportunity._id).populate(
      "postedBy",
      "name role profilePhoto industry company"
    );

    res.status(201).json({
      success: true,
      message: "Opportunity posted successfully",
      opportunity: populatedOpportunity,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "A valid opportunity id is required",
      });
    }

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    const isOwner = opportunity.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "Admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own opportunities",
      });
    }

    await Opportunity.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Opportunity deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
