import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../api/axios";

interface Member {
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  role: "OWNER" | "MEMBER";
}

interface Room {
  _id: string;
  name: string;
  members: Member[];
}

const categories = [
  "RENT",
  "FOOD",
  "UTILITIES",
  "INTERNET",
  "TRANSPORT",
  "SHOPPING",
  "OTHER",
];

export default function AddExpensePage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] =
    useState<Room | null>(null);

  const [title, setTitle] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [category, setCategory] =
    useState("FOOD");

  const [selectedMembers, setSelectedMembers] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    fetchRoom();
  }, []);

  const fetchRoom = async () => {
    try {
      const response = await api.get(
        `/rooms/${roomId}`
      );

      const roomData =
        response.data.data;

      setRoom(roomData);

      setSelectedMembers(
        roomData.members.map(
          (member: Member) =>
            member.userId._id
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const toggleMember = (
    memberId: string
  ) => {
    setSelectedMembers((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter(
          (id) => id !== memberId
        );
      }

      return [...prev, memberId];
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (!room) return;

    if (!title.trim()) {
      setError(
        "Expense title is required"
      );
      return;
    }

    if (!amount) {
      setError(
        "Amount is required"
      );
      return;
    }

    if (
      selectedMembers.length === 0
    ) {
      setError(
        "Select at least one member"
      );
      return;
    }

    const totalAmount =
      Number(amount);

    const splitAmount =
      totalAmount /
      selectedMembers.length;

    const splits =
      selectedMembers.map(
        (memberId) => ({
          userId: memberId,
          amount: Number(
            splitAmount.toFixed(2)
          ),
        })
      );

    const totalSplit =
      splits.reduce(
        (sum, split) =>
          sum + split.amount,
        0
      );

    const difference =
      totalAmount - totalSplit;

    if (
      Math.abs(difference) > 0
    ) {
      splits[0].amount +=
        difference;
    }

    try {
      setLoading(true);

      await api.post(
        "/expenses",
        {
          roomId,
          title,
          amount: totalAmount,
          category,
          splits,
          isSettlement: false,
        }
      );

      navigate(`/rooms/${roomId}`);
    } catch (err: any) {
      setError(
        err?.response?.data
          ?.message ||
          "Failed to add expense"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!room) {
    return (
      <div className="p-4 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Add Expense
        </h1>

        <p className="mt-2 text-zinc-400">
          {room.name}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            placeholder="Dinner, Rent..."
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Amount
          </label>

          <input
            type="number"
            value={amount}
            onChange={(e) =>
              setAmount(
                e.target.value
              )
            }
            placeholder="0"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Category
          </label>

          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 outline-none"
          >
            {categories.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="mb-3 block text-sm text-zinc-400">
            Split Between
          </label>

          <div className="space-y-3">
            {room.members.map(
              (member) => (
                <label
                  key={
                    member.userId._id
                  }
                  className="flex cursor-pointer items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                >
                  <div>
                    <p className="font-medium">
                      {
                        member.userId
                          .name
                      }
                    </p>

                    <p className="text-sm text-zinc-400">
                      {
                        member.role
                      }
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(
                      member.userId._id
                    )}
                    onChange={() =>
                      toggleMember(
                        member.userId
                          ._id
                      )
                    }
                  />
                </label>
              )
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-lime-500 p-4 font-semibold text-black"
        >
          {loading
            ? "Adding Expense..."
            : "Add Expense"}
        </button>
      </form>
    </div>
  );
}