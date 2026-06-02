import { Response } from "express";

import { DashboardService } from "./dashboard.service";
import { ApiResponse } from "../../utils/apiResponse";
import { AuthRequest } from "../../middlewares/auth.middleware";

export class DashboardController {
  static async getRoomDashboard(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    const dashboard =
      await DashboardService.getRoomDashboard(
        req.params.roomId as string
      );

    res.status(200).json(
      new ApiResponse(
        true,
        "Dashboard fetched successfully",
        dashboard
      )
    );
  }
}