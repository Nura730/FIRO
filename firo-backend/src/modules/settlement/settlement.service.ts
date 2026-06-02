import { Expense } from "../expense/expense.model";
import { Room } from "../room/room.model";
import { AppError } from "../../utils/appError";

export class SettlementService {
  static async calculateRoomSettlement(
    roomId: string
  ) {
    const room = await Room.findById(roomId)
      .populate(
        "members.userId",
        "name email"
      );

    if (!room) {
      throw new AppError(
        "Room not found",
        404
      );
    }

    const expenses = await Expense.find({
      roomId,
    });

    const balances = new Map<
      string,
      {
        userId: string;
        name: string;
        balance: number;
      }
    >();

    room.members.forEach((member: any) => {
      balances.set(
        member.userId._id.toString(),
        {
          userId:
            member.userId._id.toString(),
          name: member.userId.name,
          balance: 0,
        }
      );
    });

    for (const expense of expenses) {
      const paidBy =
        expense.paidBy.toString();

      const payer =
        balances.get(paidBy);

      if (payer) {
        payer.balance += expense.amount;
      }

      for (const split of expense.splits) {
        const member =
          balances.get(
            split.userId.toString()
          );

        if (member) {
          member.balance -= split.amount;
        }
      }
    }

    const balanceList =
  Array.from(
    balances.values()
  );

const creditors =
  balanceList
    .filter(
      (member) =>
        member.balance > 0
    )
    .sort(
      (a, b) =>
        b.balance - a.balance
    );

const debtors =
  balanceList
    .filter(
      (member) =>
        member.balance < 0
    )
    .sort(
      (a, b) =>
        a.balance - b.balance
    );

const settlements = [];

let creditorIndex = 0;
let debtorIndex = 0;

while (
  creditorIndex <
    creditors.length &&
  debtorIndex <
    debtors.length
) {
  const creditor =
    creditors[creditorIndex];

  const debtor =
    debtors[debtorIndex];

  const amount = Math.min(
    creditor.balance,
    Math.abs(
      debtor.balance
    )
  );

  settlements.push({
    from: debtor.name,
    to: creditor.name,
    amount,
  });

  creditor.balance -= amount;
  debtor.balance += amount;

  if (
    creditor.balance === 0
  ) {
    creditorIndex++;
  }

  if (
    debtor.balance === 0
  ) {
    debtorIndex++;
  }
}

return {
  roomId,

  totalExpenses:
    expenses.reduce(
      (sum, expense) =>
        sum + expense.amount,
      0
    ),

  balances:
    balanceList,

  settlements,
};
  }
}