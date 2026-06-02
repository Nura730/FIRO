import { Router } from "express";

import { DashboardController } from "./dashboard.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get(
  "/room/:roomId",
  authenticate,
  asyncHandler(
    DashboardController.getRoomDashboard
  )
);

export default router;