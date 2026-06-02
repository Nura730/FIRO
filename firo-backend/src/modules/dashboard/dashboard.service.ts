import { Expense } from "../expense/expense.model";
import { Room } from "../room/room.model";

export class DashboardService {
  static async getRoomDashboard(
    roomId: string
  ) {
    const room = await Room.findById(roomId)
      .populate(
        "members.userId",
        "name email"
      );

    if (!room) {
      throw new Error("Room not found");
    }

    const expenses = await Expense.find({
      roomId,
    })
      .populate(
        "paidBy",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    const totalExpenses =
      expenses.reduce(
        (sum, expense) =>
          sum + expense.amount,
        0
      );

    return {
      roomId,

      roomName: room.name,

      memberCount:
        room.members.length,

      expenseCount:
        expenses.length,

      totalExpenses,

      recentExpenses:
        expenses.slice(0, 5),
    };
  }
}