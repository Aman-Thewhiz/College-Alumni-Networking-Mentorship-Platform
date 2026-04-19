import express from "express";
import {
  createOpportunity,
  deleteOpportunity,
  getOpportunities,
} from "../controllers/opportunityController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getOpportunities);
router.post("/", protect, authorizeRoles("Alumni"), createOpportunity);
router.delete("/:id", protect, authorizeRoles("Alumni", "Admin"), deleteOpportunity);

export default router;
