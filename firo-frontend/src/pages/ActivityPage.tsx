import { useEffect, useState } from "react";
import api from "../api/axios";

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  createdAt: string;
  paidBy: {
    _id: string;
    name: string;
    email: string;
  };
}

interface Room {
  _id: string;
  name: string;
}

export default function ActivityPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const roomResponse = await api.get(
        "/rooms/my-rooms"
      );

      const rooms: Room[] =
        roomResponse.data.data;

      if (!rooms.length) {
        setLoading(false);
        return;
      }

      const roomId = rooms[0]._id;

      const expenseResponse = await api.get(
        `/expenses/room/${roomId}`
      );

      setExpenses(
        expenseResponse.data.data || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 text-white">
        Loading activity...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <h1 className="mb-6 text-3xl font-bold">
        Activity
      </h1>

      {expenses.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 text-center text-zinc-400">
          No expenses found
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div
              key={expense._id}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {expense.title}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Paid by {expense.paidBy.name}
                  </p>
                </div>

                <h3 className="text-xl font-bold text-lime-400">
                  ₹{expense.amount}
                </h3>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs">
                  {expense.category}
                </span>

                <span className="text-xs text-zinc-500">
                  {new Date(
                    expense.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}