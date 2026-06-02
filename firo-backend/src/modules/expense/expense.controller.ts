import { Response } from "express";

import { ExpenseService } from "./expense.service";
import { ApiResponse } from "../../utils/apiResponse";
import { AuthRequest } from "../../middlewares/auth.middleware";

export class ExpenseController {
  static async createExpense(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    const {
      roomId,
      title,
      amount,
      category,
      splits,
    } = req.body;

    const expense =
      await ExpenseService.createExpense(
        req.user!.userId,
        roomId,
        title,
        amount,
        category,
        splits
      );

    res.status(201).json(
      new ApiResponse(
        true,
        "Expense added successfully",
        expense
      )
    );
  }

  static async getRoomExpenses(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    const expenses =
      await ExpenseService.getRoomExpenses(
        req.params.roomId as string
      );

    res.status(200).json(
      new ApiResponse(
        true,
        "Expenses fetched successfully",
        expenses
      )
    );
  }
}