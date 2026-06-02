import mongoose, { Types } from "mongoose";

import { Expense } from "./expense.model";
import { Room } from "../room/room.model";
import { AppError } from "../../utils/appError";

interface SplitInput {
  userId: string;
  amount: number;
}

export class ExpenseService {
  static async createExpense(
    userId: string,
    roomId: string,
    title: string,
    amount: number,
    category: string,
    splits: SplitInput[]
  ) {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new AppError(
        "Invalid room id",
        400
      );
    }

    const room = await Room.findById(roomId);

    if (!room) {
      throw new AppError(
        "Room not found",
        404
      );
    }

    const isMember = room.members.some(
      (member) =>
        member.userId.toString() === userId
    );

    if (!isMember) {
      throw new AppError(
        "Not a room member",
        403
      );
    }

    const splitTotal = splits.reduce(
      (sum, split) => sum + split.amount,
      0
    );

    if (splitTotal !== amount) {
      throw new AppError(
        "Split total must equal expense amount",
        400
      );
    }

    for (const split of splits) {
      const memberExists =
        room.members.some(
          (member) =>
            member.userId.toString() ===
            split.userId
        );

      if (!memberExists) {
        throw new AppError(
          "Split contains non-room member",
          400
        );
      }
    }

    return Expense.create({
      roomId: new Types.ObjectId(roomId),

      title,
      amount,
      category,

      paidBy: new Types.ObjectId(userId),
      createdBy: new Types.ObjectId(userId),

      splits: splits.map((split) => ({
        userId: new Types.ObjectId(
          split.userId
        ),
        amount: split.amount,
      })),
    });
  }

  static async getRoomExpenses(
    roomId: string
  ) {
    return Expense.find({
      roomId,
    })
      .populate(
        "paidBy",
        "name email"
      )
      .populate(
        "splits.userId",
        "name email"
      )
      .sort({
        createdAt: -1,
      });
  }


  static async updateExpense(
  expenseId: string,
  userId: string,
  title: string,
  amount: number,
  category: string
) {
  const expense =
    await Expense.findById(expenseId);

  if (!expense) {
    throw new AppError(
      "Expense not found",
      404
    );
  }

  if (
    expense.createdBy.toString() !==
    userId
  ) {
    throw new AppError(
      "Unauthorized",
      403
    );
  }

  expense.title = title;
  expense.amount = amount;
  expense.category = category;

  await expense.save();

  return expense;
}



static async deleteExpense(
  expenseId: string,
  userId: string
) {
  const expense =
    await Expense.findById(expenseId);

  if (!expense) {
    throw new AppError(
      "Expense not found",
      404
    );
  }

  if (
    expense.createdBy.toString() !==
    userId
  ) {
    throw new AppError(
      "Unauthorized",
      403
    );
  }

  await Expense.findByIdAndDelete(
    expenseId
  );
}
}