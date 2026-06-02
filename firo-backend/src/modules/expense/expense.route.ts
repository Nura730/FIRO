import { Router } from "express";

import { ExpenseController } from "./expense.controller";
import { createExpenseSchema } from "./expense.validation";

import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createExpenseSchema),
  asyncHandler(
    ExpenseController.createExpense
  )
);

router.get(
  "/room/:roomId",
  authenticate,
  asyncHandler(
    ExpenseController.getRoomExpenses
  )
);

export default router;