import { useNavigate } from "react-router-dom";
import {
  Users,
  PlusCircle,
  Receipt,
  ArrowRight,
} from "phosphor-react";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome 👋
        </h1>

        <p className="mt-2 text-zinc-400">
          Manage shared expenses easily
        </p>
      </div>

      {/* Balance Card */}

      <div className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-zinc-400">
          Total Balance
        </p>

        <h2 className="mt-2 text-4xl font-bold text-lime-400">
          ₹0
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Your settlements will appear here
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
              navigate("/expense/add")
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

      {/* Stats */}

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
              0
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
              0
            </h4>

            <p className="text-sm text-zinc-400">
              Rooms
            </p>
          </div>
        </div>
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

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-zinc-400">
            No recent activity
          </p>
        </div>
      </div>
    </div>
  );
}