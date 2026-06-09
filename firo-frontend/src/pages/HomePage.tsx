import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import {
  Users,
  PlusCircle,
  Receipt,
  ArrowRight,
  ArrowsLeftRight,
} from "phosphor-react";

import type { Room } from "../types/room";
import type { DashboardData } from "../types/dashboard";

export default function HomePage() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [loading, setLoading] =
    useState(true);

  const [rooms, setRooms] = useState<
    Room[]
  >([]);

  const [selectedRoomId, setSelectedRoomId] =
    useState("");

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(
      null
    );

  const currentBalance =
    dashboard?.balances.find(
      (balance) =>
        balance.userId === user.id
    );

  const fetchRooms = async () => {
    const response =
      await api.get("/rooms/my-rooms");

    const roomsData =
      response.data.data || [];

    setRooms(roomsData);

    const savedRoom =
      localStorage.getItem(
        "selectedRoomId"
      );

    const roomId =
      savedRoom &&
      roomsData.some(
        (room: Room) =>
          room._id === savedRoom
      )
        ? savedRoom
        : roomsData[0]?._id;

    if (roomId) {
      setSelectedRoomId(roomId);
    }
  };

  const fetchDashboard = async (
    roomId: string
  ) => {
    try {
      const response =
        await api.get(
          `/dashboard/room/${roomId}`
        );

      setDashboard(
        response.data.data
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await fetchRooms();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!selectedRoomId) return;

    localStorage.setItem(
      "selectedRoomId",
      selectedRoomId
    );

    fetchDashboard(selectedRoomId);
  }, [selectedRoomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 text-white">
        Loading...
      </div>
    );
  }

  if (!rooms.length) {
    return (
      <div className="min-h-screen bg-black p-4 text-white">
        <div className="mt-20 text-center">
          <h1 className="mb-4 text-3xl font-bold">
            Welcome 👋
          </h1>

          <p className="mb-8 text-zinc-400">
            Create your first workspace
            to start tracking expenses.
          </p>

          <button
            onClick={() =>
              navigate("/rooms")
            }
            className="rounded-2xl bg-lime-500 px-6 py-3 font-semibold text-black"
          >
            Go To Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 pb-24 text-white">
      {/* Header */}

      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Welcome, {user.name} 👋
        </h1>

        <p className="mt-2 text-zinc-400">
          FIRO 2.0 Dashboard
        </p>
      </div>

      {/* Workspace Selector */}

      <div className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="mb-2 text-sm text-zinc-400">
          Current Workspace
        </p>

        <select
          value={selectedRoomId}
          onChange={(e) =>
            setSelectedRoomId(
              e.target.value
            )
          }
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none"
        >
          {rooms.map((room) => (
            <option
              key={room._id}
              value={room._id}
            >
              {room.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">
            You Owe
          </p>

          <h3 className="mt-2 text-2xl font-bold text-red-400">
            ₹
            {currentBalance &&
            currentBalance.balance < 0
              ? Math.abs(
                  currentBalance.balance
                )
              : 0}
          </h3>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">
            You Receive
          </p>

          <h3 className="mt-2 text-2xl font-bold text-lime-400">
            ₹
            {currentBalance &&
            currentBalance.balance > 0
              ? currentBalance.balance
              : 0}
          </h3>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">
            Expenses
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            {
              dashboard?.expenseCount
            }
          </h3>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">
            Settlements
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            {
              dashboard?.totalSettlements
            }
          </h3>
        </div>
      </div>

      {/* Quick Actions */}

      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() =>
              navigate(
                `/rooms/${selectedRoomId}/add-expense`
              )
            }
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left"
          >
            <PlusCircle
              size={24}
              className="mb-2 text-lime-400"
            />

            Add Expense
          </button>

          <button
            onClick={() =>
              navigate("/rooms")
            }
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left"
          >
            <Users
              size={24}
              className="mb-2 text-lime-400"
            />

            Rooms
          </button>

          <button
            onClick={() =>
              navigate("/activity")
            }
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left"
          >
            <Receipt
              size={24}
              className="mb-2 text-lime-400"
            />

            Activity
          </button>

          <button
            onClick={() =>
              navigate(
                `/rooms/${selectedRoomId}`
              )
            }
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left"
          >
            <ArrowsLeftRight
              size={24}
              className="mb-2 text-lime-400"
            />

            Workspace
          </button>
        </div>
      </div>

      {/* Workspaces */}

      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Workspaces
          </h2>

          <button
            onClick={() =>
              navigate("/rooms")
            }
            className="text-lime-400"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {rooms.map((room) => (
            <div
              key={room._id}
              onClick={() =>
                setSelectedRoomId(
                  room._id
                )
              }
              className={`cursor-pointer rounded-2xl border p-4 ${
                selectedRoomId ===
                room._id
                  ? "border-lime-500 bg-lime-500/10"
                  : "border-zinc-800 bg-zinc-900"
              }`}
            >
              <h3 className="font-semibold">
                {room.name}
              </h3>

              <p className="mt-1 text-sm text-zinc-400">
                {room.members.length}{" "}
                Members
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Recent Activity
          </h2>

          <button
            onClick={() =>
              navigate("/activity")
            }
            className="flex items-center gap-1 text-lime-400"
          >
            View All
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {dashboard?.recentExpenses
            ?.length ? (
            dashboard.recentExpenses.map(
              (expense) => (
                <div
                  key={expense._id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                >
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">
                        {
                          expense.title
                        }
                      </h4>

                      <p className="text-sm text-zinc-400">
                        {
                          expense.category
                        }
                      </p>
                    </div>

                    <p className="font-bold text-lime-400">
                      ₹
                      {
                        expense.amount
                      }
                    </p>
                  </div>
                </div>
              )
            )
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              No activity found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}