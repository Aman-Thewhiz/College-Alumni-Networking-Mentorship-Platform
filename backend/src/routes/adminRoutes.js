import express from "express";
import {
  deleteUserByAdmin,
  getAdminStats,
  getAdminUsers,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("Admin"));

router.get("/users", getAdminUsers);
router.delete("/users/:id", deleteUserByAdmin);
router.get("/stats", getAdminStats);

export default router;
