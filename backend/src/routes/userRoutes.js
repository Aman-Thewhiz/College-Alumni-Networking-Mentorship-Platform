import express from "express";
import { getUserPublicProfile, getUsers, updateUserProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserPublicProfile);
router.put("/:id", protect, updateUserProfile);

export default router;
