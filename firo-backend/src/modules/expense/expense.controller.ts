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



  static async updateExpense(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const expense =
    await ExpenseService.updateExpense(
      req.params.expenseId as string,
      req.user!.userId,
      req.body.title,
      req.body.amount,
      req.body.category
    );

  res.status(200).json(
    new ApiResponse(
      true,
      "Expense updated",
      expense
    )
  );
}

static async deleteExpense(
  req: AuthRequest,
  res: Response
): Promise<void> {
  await ExpenseService.deleteExpense(
    req.params.expenseId as string,
    req.user!.userId
  );

  res.status(200).json(
    new ApiResponse(
      true,
      "Expense deleted"
    )
  );
}
}