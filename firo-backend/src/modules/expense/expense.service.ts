import { Types } from "mongoose";

import { Expense } from "./expense.model";
import { Room } from "../room/room.model";
import { AppError } from "../../utils/appError";

export class ExpenseService {
  static async createExpense(
    userId: string,
    roomId: string,
    title: string,
    amount: number,
    category: string
  ) {
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

    return Expense.create({
      roomId: new Types.ObjectId(roomId),
      title,
      amount,
      category,
      paidBy: new Types.ObjectId(userId),
      createdBy: new Types.ObjectId(userId),
    });
  }

  static async getRoomExpenses(
    roomId: string
  ) {
    return Expense.find({
      roomId,
    })
      .populate("paidBy", "name email")
      .sort({ createdAt: -1 });
  }
}