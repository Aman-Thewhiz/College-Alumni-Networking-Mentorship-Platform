import express from "express";
import {
  getConversations,
  getMessagesBetweenUsers,
  sendMessage,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("Student", "Alumni"));

router.get("/conversations", getConversations);
router.get("/:userId", getMessagesBetweenUsers);
router.post("/", sendMessage);

export default router;
