import { Expense } from "../expense/expense.model";
import { Room } from "../room/room.model";
import { AppError } from "../../utils/appError";

export class SettlementService {
  static async calculateRoomSettlement(roomId: string) {
    const room = await Room.findById(roomId).populate(
      "members.userId",
      "name email"
    );

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    const expenses = await Expense.find({ roomId });

    const balances = new Map<
      string,
      {
        userId: string;
        name: string;
        email: string;
        balance: number;
      }
    >();

    room.members.forEach((member: any) => {
      const uId = member.userId._id.toString();
      balances.set(uId, {
        userId: uId,
        name: member.userId.name,
        email: member.userId.email,
        balance: 0,
      });
    });

    for (const expense of expenses) {
      const paidBy = expense.paidBy.toString();
      const payer = balances.get(paidBy);

      if (payer) {
        payer.balance += expense.amount;
      }

      for (const split of expense.splits) {
        const member = balances.get(split.userId.toString());
        if (member) {
          member.balance -= split.amount;
        }
      }
    }

    const balanceList = Array.from(balances.values());

    const creditors = balanceList
      .filter((member) => member.balance > 0.01)
      .sort((a, b) => b.balance - a.balance);

    const debtors = balanceList
      .filter((member) => member.balance < -0.01)
      .sort((a, b) => a.balance - b.balance);

    const settlements = [];

    let creditorIndex = 0;
    let debtorIndex = 0;

    // Deep copy creditors/debtors to avoid mutating balanceList directly in calculations
    const activeCreditors = creditors.map((c) => ({ ...c }));
    const activeDebtors = debtors.map((d) => ({ ...d }));

    while (
      creditorIndex < activeCreditors.length &&
      debtorIndex < activeDebtors.length
    ) {
      const creditor = activeCreditors[creditorIndex];
      const debtor = activeDebtors[debtorIndex];

      const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

      if (amount > 0.01) {
        settlements.push({
          from: {
            id: debtor.userId,
            name: debtor.name,
            email: debtor.email,
          },
          to: {
            id: creditor.userId,
            name: creditor.name,
            email: creditor.email,
          },
          amount: Math.round(amount * 100) / 100, // round to 2 decimal places
        });
      }

      creditor.balance -= amount;
      debtor.balance += amount;

      if (creditor.balance <= 0.01) {
        creditorIndex++;
      }

      if (debtor.balance >= -0.01) {
        debtorIndex++;
      }
    }

    return {
      roomId,
      totalExpenses: expenses
        .filter((e) => !e.isSettlement)
        .reduce((sum, expense) => sum + expense.amount, 0),
      balances: balanceList.map((b) => ({
        ...b,
        balance: Math.round(b.balance * 100) / 100,
      })),
      settlements,
    };
  }
}