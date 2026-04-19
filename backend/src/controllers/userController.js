import User from "../models/User.js";

const EDITABLE_PROFILE_FIELDS = [
  "bio",
  "skills",
  "industry",
  "graduationYear",
  "company",
  "experience",
  "profilePhoto",
];

const normalizeSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills.map((skill) => String(skill).trim()).filter(Boolean);
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getUsers = async (req, res, next) => {
  try {
    const allowedRoles = ["Student", "Alumni", "Admin"];
    const requestedRole = req.query.role;
    const role = allowedRoles.includes(requestedRole) ? requestedRole : "Alumni";

    const search = String(req.query.search || "").trim();
    const industries = String(req.query.industry || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const skills = String(req.query.skills || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const requestedLimit = Number.parseInt(req.query.limit, 10) || 12;
    const limit = Math.max(1, Math.min(requestedLimit, 50));
    const skip = (page - 1) * limit;

    const query = { role };

    if (industries.length > 0) {
      query.industry = {
        $in: industries.map((industry) => new RegExp(`^${escapeRegex(industry)}$`, "i")),
      };
    }

    if (skills.length > 0) {
      query.skills = {
        $in: skills.map((skill) => new RegExp(`^${escapeRegex(skill)}$`, "i")),
      };
    }

    if (search) {
      const keywordRegex = new RegExp(escapeRegex(search), "i");
      query.$or = [{ name: keywordRegex }, { bio: keywordRegex }];
    }

    const [users, total] = await Promise.all([
      User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.status(200).json({
      success: true,
      count: users.length,
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    for (const field of EDITABLE_PROFILE_FIELDS) {
      if (req.body[field] === undefined) {
        continue;
      }

      if (field === "skills") {
        user.skills = normalizeSkills(req.body.skills);
        continue;
      }

      if (field === "graduationYear") {
        if (req.body.graduationYear === "" || req.body.graduationYear === null) {
          user.graduationYear = undefined;
        } else {
          const parsedYear = Number(req.body.graduationYear);
          if (Number.isNaN(parsedYear)) {
            res.status(400);
            throw new Error("Graduation year must be a valid number");
          }
          user.graduationYear = parsedYear;
        }
        continue;
      }

      user[field] = typeof req.body[field] === "string" ? req.body[field].trim() : req.body[field];
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
