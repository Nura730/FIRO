import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import {
  Users,
  PlusCircle,
  Receipt,
  ArrowRight,
} from "phosphor-react";

interface Room {
  _id: string;
  name: string;
}

interface DashboardData {
  roomName: string;
  memberCount: number;
  expenseCount: number;
  totalExpenses: number;

  recentExpenses: {
    _id: string;
    title: string;
    amount: number;
    category: string;
    createdAt: string;
  }[];

  balances: {
    userId: string;
    name: string;
    email: string;
    balance: number;
  }[];
}

export default function HomePage() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );
  console.log(user)
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [roomCount, setRoomCount] =
    useState(0);

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(
      null
    );

  const fetchDashboard = async () => {
    try {
      const roomsResponse =
        await api.get(
          "/rooms/my-rooms"
        );

      const rooms: Room[] =
        roomsResponse.data.data || [];

      setRoomCount(rooms.length);

      if (!rooms.length) {
        setLoading(false);
        return;
      }

      const roomId = rooms[0]._id;

      const dashboardResponse =
        await api.get(
          `/dashboard/room/${roomId}`
        );

      setDashboard(
        dashboardResponse.data.data
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome, {user.name || ""} 👋
        </h1>

        <p className="mt-2 text-zinc-400">
          Manage shared expenses easily
        </p>
      </div>

      {/* Balance */}

      <div className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-zinc-400">
          Total Expenses
        </p>

        <h2 className="mt-2 text-4xl font-bold text-lime-400">
          ₹
          {dashboard?.totalExpenses ||
            0}
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          {dashboard?.roomName ||
            "No room selected"}
        </p>
      </div>

      {/* Quick Actions */}

      <div className="mb-6">
        <h3 className="mb-4 text-lg font-semibold">
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() =>
              navigate("/rooms")
            }
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left"
          >
            <Users
              size={24}
              className="mb-3 text-lime-400"
            />

            <h4 className="font-medium">
              Rooms
            </h4>

            <p className="mt-1 text-sm text-zinc-400">
              Manage rooms
            </p>
          </button>

          <button
            onClick={() =>
              navigate("/rooms")
            }
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left"
          >
            <PlusCircle
              size={24}
              className="mb-3 text-lime-400"
            />

            <h4 className="font-medium">
              Add Expense
            </h4>

            <p className="mt-1 text-sm text-zinc-400">
              Create expense
            </p>
          </button>
        </div>
      </div>

      {/* Overview */}

      <div className="mb-6">
        <h3 className="mb-4 text-lg font-semibold">
          Overview
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <Receipt
              size={24}
              className="mb-2 text-lime-400"
            />

            <h4 className="text-2xl font-bold">
              {dashboard?.expenseCount ||
                0}
            </h4>

            <p className="text-sm text-zinc-400">
              Expenses
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <Users
              size={24}
              className="mb-2 text-lime-400"
            />

            <h4 className="text-2xl font-bold">
              {roomCount}
            </h4>

            <p className="text-sm text-zinc-400">
              Rooms
            </p>
          </div>
        </div>
      </div>

      {/* Members */}

      <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-sm text-zinc-400">
          Members
        </p>

        <h3 className="mt-2 text-3xl font-bold">
          {dashboard?.memberCount ||
            0}
        </h3>
      </div>

      {/* Recent Activity */}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Recent Activity
          </h3>

          <button
            onClick={() =>
              navigate("/activity")
            }
            className="flex items-center gap-1 text-sm text-lime-400"
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
                  <div className="flex items-center justify-between">
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

                    <span className="font-bold text-lime-400">
                      ₹
                      {
                        expense.amount
                      }
                    </span>
                  </div>
                </div>
              )
            )
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-zinc-400">
                No recent activity
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}