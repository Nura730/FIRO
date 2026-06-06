import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
interface Member {
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  role: "OWNER" | "MEMBER";
  joinedAt: string;
}

interface Room {
  _id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  members: Member[];
  createdAt: string;
  updatedAt: string;
}

export default function RoomDetailsPage() {
  const { roomId } = useParams();
const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(
    null
  );

  const [loading, setLoading] =
    useState(true);

  const fetchRoom = async () => {
    try {
      const response = await api.get(
        `/rooms/${roomId}`
      );

      setRoom(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 text-white">
        Loading room...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-black p-4 text-white">
        Room not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      {/* Header */}

      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {room.name}
        </h1>

        <p className="mt-2 text-zinc-400">
          Room Details
        </p>
      </div>

      {/* Invite Code */}

      <div className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-sm text-zinc-400">
          Invite Code
        </p>

        <h2 className="mt-2 text-2xl font-bold text-lime-400">
          {room.inviteCode}
        </h2>
      </div>

      <button
  onClick={() =>
    navigate(
      `/rooms/${room._id}/add-expense`
    )
  }
  className="mb-6 w-full rounded-2xl bg-lime-500 p-4 font-semibold text-black"
>
  Add Expense
</button>

      {/* Overview */}

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">
            Members
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            {room.members.length}
          </h3>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">
            Expenses
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            0
          </h3>
        </div>
      </div>

      {/* Members */}

      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">
          Members
        </h2>

        <div className="space-y-3">
          {room.members.map((member) => (
            <div
              key={member.userId._id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {member.userId.name}
                  </h3>

                  <p className="text-sm text-zinc-400">
                    {member.userId.email}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    member.role === "OWNER"
                      ? "bg-lime-500/20 text-lime-400"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses */}

      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">
          Expenses
        </h2>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-zinc-400">
            No expenses yet.
          </p>
        </div>
      </div>

      {/* Settlements */}

      <div>
        <h2 className="mb-4 text-xl font-semibold">
          Settlements
        </h2>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-zinc-400">
            No settlements available.
          </p>
        </div>
      </div>
    </div>
  );
}