import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, Copy, Check, Plus, ArrowRight, Wallet } from "lucide-react";

import Button from "../../../components/ui/Button";
import Card, { CardContent } from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import { Skeleton } from "../../../components/ui/Skeleton";
import ExpenseModal from "../../expenses/components/ExpenseModal";

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
  const [modalOpen, setModalOpen] = useState(false);

  if (!room) {
    navigate("/rooms");
    return null;
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.inviteCode);
    setCopied(true);
    showToast("Invite code copied!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const dashboard = data?.data;
  const recentExpenses = dashboard?.recentExpenses || [];
  const balances = dashboard?.balances || [];

  // Find current user's balance
  const myBalanceVal = balances.find(
    (b: any) => b.name === user?.name
  )?.balance || 0;

  const isOwed = myBalanceVal > 0;
  const isOwe = myBalanceVal < 0;

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "GOOD MORNING";
    if (hours < 17) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white px-4 py-6 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-64 animate-pulse" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="space-y-4 pt-6">
          <Skeleton className="h-4 w-24" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white px-4 py-6 space-y-6">
      {/* Active Room Sub-header */}
      <div className="flex justify-between items-center pl-0.5">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#22C55E] uppercase">
            {getGreeting()}
          </span>
          <h2 className="text-sm font-bold text-white mt-0.5">
            Active Room: {dashboard?.roomName || room.roomName}
          </h2>
        </div>

        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-[#22C55E]" />
              <span className="text-[#22C55E]">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>{room.inviteCode}</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Net Balance block (First visual focus - Large typography) */}
      <Card className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl">
  <CardContent className="p-6">
    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
      Net Balance
    </p>

    <h2
      className={`mt-3 text-5xl font-black ${
        isOwed
          ? "text-[#22C55E]"
          : isOwe
          ? "text-red-400"
          : "text-zinc-500"
      }`}
    >
      {isOwed
        ? `+₹${myBalanceVal.toLocaleString("en-IN")}`
        : isOwe
        ? `-₹${Math.abs(myBalanceVal).toLocaleString("en-IN")}`
        : "₹0"}
    </h2>

    <p className="mt-2 text-sm text-zinc-500">
      {isOwed
        ? "You are owed money"
        : isOwe
        ? "You owe money"
        : "Everything is settled"}
    </p>

    <Button
      onClick={() => navigate("/settlements")}
      className="mt-5"
    >
      View Settlements
    </Button>
  </CardContent>
</Card>

        {/* Balance Action */}
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={() => navigate("/settlements")}
            className="flex items-center gap-1.5 font-bold"
          >
            <Wallet size={14} />
            Settle Balances
            <ArrowRight size={12} />
          </Button>
        </div>


      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
  <CardContent className="p-5">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">
          Active Room
        </p>

        <h3 className="mt-1 text-lg font-bold text-white">
          {dashboard?.roomName || room.roomName}
        </h3>
      </div>

      <button
        onClick={handleCopyCode}
        className="rounded-xl border border-white/10 px-3 py-2 text-sm"
      >
        {copied ? "Copied" : room.inviteCode}
      </button>
    </div>
  </CardContent>
</Card>

      {/* Divider */}
      <div className="h-[1px] bg-zinc-150" />

      {/* 2. Recent Activity (Second visual focus - Vertical List) */}
      <div className="space-y-4">
        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase pl-0.5">
          Recent Activity
        </span>

        {!recentExpenses.length ? (
          <EmptyState
            icon={Receipt}
            title="No activity yet"
            description="Add an expense using the button below to start splitting bills."
          />
        ) : (
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardContent className="p-0 divide-y divide-zinc-100">
              {recentExpenses.map((expense: any) => (
                <div
                  key={expense._id}
                  onClick={() => navigate("/expenses")}
                  className="flex justify-between items-center p-5 cursor-pointer active:bg-zinc-50/50 transition-colors"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">
                      {expense.title}
                    </h4>
                    <p className="text-xs text-zinc-500 font-semibold mt-1">
                      Paid by {expense.paidBy?.name || "Unknown"}
                    </p>
                  </div>

                  <p className="font-bold text-white font-mono text-sm ml-3 shrink-0">
                    ₹{expense.amount?.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-24 right-5 z-40">
        <button
          onClick={() => setModalOpen(true)}
          title="Add expense"
          className="w-16 h-16 rounded-full bg-[#22C55E] shadow-[0_0_40px_rgba(34,197,94,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-white"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        roomId={roomId}
      />
    </div>
  );
}