import express from "express";
import {
  createMentorshipRequest,
  getReceivedMentorshipRequests,
  getSentMentorshipRequests,
  updateMentorshipRequestStatus,
} from "../controllers/mentorshipController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("Student"), createMentorshipRequest);
router.get("/sent", authorizeRoles("Student"), getSentMentorshipRequests);
router.get("/received", authorizeRoles("Alumni"), getReceivedMentorshipRequests);
router.put("/:id", authorizeRoles("Alumni"), updateMentorshipRequestStatus);

export default router;
