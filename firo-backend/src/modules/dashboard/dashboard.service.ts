import { Expense } from "../expense/expense.model";
import { Room } from "../room/room.model";
import { SettlementService } from "../settlement/settlement.service";
import { AppError } from "../../utils/appError";

export class DashboardService {
  static async getRoomDashboard(roomId: string) {
    const room = await Room.findById(roomId).populate(
      "members.userId",
      "name email"
    );

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    const expenses = await Expense.find({ roomId })
      .populate("paidBy", "name email")
      .sort({ createdAt: -1 });

    const nonSettlementExpenses = expenses.filter((e) => !e.isSettlement);

    const totalExpenses = nonSettlementExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Group expenses by month (e.g. "Jun 2026")
    const monthlyMap = new Map<string, number>();
    
    // Process in chronological order to populate the map in order
    const chronologicalExpenses = [...nonSettlementExpenses].reverse();
    chronologicalExpenses.forEach((expense) => {
      const date = new Date(expense.createdAt);
      const label = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      monthlyMap.set(label, (monthlyMap.get(label) || 0) + expense.amount);
    });

    const monthlyStatistics = Array.from(monthlyMap.entries()).map(
      ([month, amount]) => ({
        month,
        amount: Math.round(amount * 100) / 100,
      })
    );

    // Get active settlements count from settlement service
    const settlementData = await SettlementService.calculateRoomSettlement(roomId);
    const totalSettlements = settlementData.settlements.length;

    return {
      roomId,
      roomName: room.name,
      memberCount: room.members.length,
      expenseCount: nonSettlementExpenses.length,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      recentExpenses: nonSettlementExpenses.slice(0, 5),
      totalSettlements,
      monthlyStatistics,
      balances: settlementData.balances,
    };
  }
}