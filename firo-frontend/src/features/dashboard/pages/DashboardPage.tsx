import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Receipt,
  Copy,
  Check,
  ArrowRight,
  Wallet,
  Users,
  FolderOpen,
} from "lucide-react";

import Button from "../../../components/ui/Button";
import Card, { CardContent } from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import { Skeleton } from "../../../components/ui/Skeleton";

import { useRoom } from "../../../providers/RoomProvider";
import { useDashboard } from "../hooks/useDashboard";
import { useAuth } from "../../../providers/AuthProvider";
import { useToast } from "../../../providers/ToastProvider";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { room } = useRoom();
  const { showToast } = useToast();

  const roomId = room?.roomId || "";
  const { data, isLoading } = useDashboard(roomId);

  const [copied, setCopied] = useState(false);

  if (!room) {
    navigate("/rooms");
    return null;
  }

  const dashboard = data?.data;
  const recentExpenses = dashboard?.recentExpenses || [];
  const balances = dashboard?.balances || [];

  const myBalanceVal =
    balances.find((b: any) => b.name === user?.name)?.balance || 0;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.inviteCode);
    setCopied(true);
    showToast("Invite code copied!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-slate-400">{getGreeting()}</p>
        <h1 className="mt-1 text-3xl font-bold text-white">
          {user?.name || "User"}
        </h1>
        <p className="mt-2 text-slate-400">
          {dashboard?.roomName || room.roomName}
        </p>
      </motion.div>

      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-violet-500/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15">
              <Wallet className="text-emerald-400" size={24} />
            </div>

            <div>
              <p className="text-sm text-slate-400">Net Balance</p>
              <h2 className="text-4xl font-bold text-white">
                {myBalanceVal > 0
                  ? `+₹${myBalanceVal.toLocaleString("en-IN")}`
                  : myBalanceVal < 0
                  ? `-₹${Math.abs(myBalanceVal).toLocaleString("en-IN")}`
                  : "₹0"}
              </h2>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Invite Code</p>
              <h3 className="mt-1 text-xl font-bold text-white">
                {room.inviteCode}
              </h3>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Button onClick={() => navigate("/expenses")}>
          <Receipt size={16} />
          Expenses
        </Button>

        <Button variant="secondary" onClick={() => navigate("/settlements")}>
          <ArrowRight size={16} />
          Settlements
        </Button>

        <Button variant="outline" onClick={() => navigate("/rooms")}>
          <Users size={16} />
          Rooms
        </Button>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <FolderOpen size={18} className="text-slate-400" />
          <h2 className="text-lg font-semibold text-white">
            Recent Activity
          </h2>
        </div>

        {!recentExpenses.length ? (
          <EmptyState
            icon={Receipt}
            title="No activity recorded"
            description="Add your first expense to get started."
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              {recentExpenses.map((expense: any) => (
                <div
                  key={expense._id}
                  onClick={() => navigate("/expenses")}
                  className="flex cursor-pointer items-center justify-between border-b border-white/5 p-4 last:border-b-0"
                >
                  <div>
                    <h4 className="font-semibold text-white">
                      {expense.title}
                    </h4>
                    <p className="text-sm text-slate-400">
                      Paid by {expense.paidBy?.name || "Unknown"}
                    </p>
                  </div>

                  <span className="font-semibold text-white">
                    ₹{expense.amount?.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
