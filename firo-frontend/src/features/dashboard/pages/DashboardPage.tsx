import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Receipt, Copy, Check, TrendingUp, Plus, ShieldCheck, CreditCard, ChevronRight } from "lucide-react";

import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import { CardSkeleton, Skeleton } from "../../../components/ui/Skeleton";
import ExpenseModal from "../../expenses/components/ExpenseModal";

import { useRoom } from "../../../providers/RoomProvider";
import { useDashboard } from "../hooks/useDashboard";
import { useAuth } from "../../../providers/AuthProvider";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { room } = useRoom();
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
    setTimeout(() => setCopied(false), 2000);
  };

  const dashboard = data?.data;
  const recentExpenses = dashboard?.recentExpenses || [];
  const monthlyStats = dashboard?.monthlyStatistics || [];
  const balances = dashboard?.balances || [];

  const maxMonthlyAmount = useMemo(() => {
    if (!monthlyStats.length) return 0;
    return Math.max(...monthlyStats.map((item: any) => item.amount));
  }, [monthlyStats]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center mt-4">
          <div className="space-y-1">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-32 animate-pulse" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <Skeleton className="h-44 w-full rounded-[24px]" />
        <div className="grid grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <Skeleton className="h-40 w-full rounded-[24px]" />
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* 1. Greeting & Room Info Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Hey, {user?.name || "Roommate"} 👋
          </h1>
          <p className="text-sm font-medium text-[#64748B] mt-0.5">
            Active Room: <span className="text-[#0F172A] font-bold">{dashboard?.roomName || room.roomName}</span>
          </p>
        </div>

        {/* Invite Code badge */}
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 text-xs font-mono font-bold bg-white border border-[#E2E8F0] shadow-sm text-slate-600 px-3.5 py-2.5 rounded-xl transition-all active:scale-95"
        >
          {copied ? (
            <>
              <Check size={14} className="text-[#22C55E]" />
              <span className="text-[#22C55E]">Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>{room.inviteCode}</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Total Expense Hero Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white border-none shadow-[0_12px_30px_rgba(15,23,42,0.15)] rounded-[24px] p-6">
          {/* Subtle design element */}
          <div className="absolute right-[-20px] top-[-20px] w-36 h-36 rounded-full bg-white/5 blur-2xl pointer-events-none" />

          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#22C55E] flex items-center gap-1">
                <CreditCard size={12} />
                Total Shared Expenses
              </span>
              <h2 className="text-[36px] font-black tracking-tight leading-none mt-1 font-mono">
                ₹{(dashboard?.totalExpenses || 0).toLocaleString("en-IN")}
              </h2>
            </div>
            
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/95">
              <ShieldCheck size={20} />
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center text-xs font-semibold text-slate-400">
            <span>Room Status: Audited</span>
            <span className="text-white bg-[#22C55E]/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase">
              {dashboard?.memberCount || 1} Roommates
            </span>
          </div>
        </Card>
      </motion.div>

      {/* 3. Small stats grid (2 columns) */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-white border-[#E2E8F0]/80 shadow-[0_8px_30px_rgba(15,23,42,0.015)] rounded-[24px]">
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Bills</p>
          <p className="text-2xl font-black mt-1.5 text-[#0F172A] font-mono">
            {dashboard?.expenseCount || 0}
          </p>
        </Card>

        <Card className="p-4 bg-white border-[#E2E8F0]/80 shadow-[0_8px_30px_rgba(15,23,42,0.015)] rounded-[24px]">
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Pending settlements</p>
          <p className="text-2xl font-black mt-1.5 text-[#0F172A] font-mono">
            {dashboard?.totalSettlements || 0}
          </p>
        </Card>
      </div>

      {/* 4. Spending Trend Chart (Large Card) */}
      {monthlyStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-5 bg-white border-[#E2E8F0]/80 shadow-[0_8px_30px_rgba(15,23,42,0.015)] rounded-[24px]">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-[#22C55E]" />
              Monthly Spending
            </h3>
            
            <div className="flex items-end justify-between h-32 pt-4 px-2 bg-slate-50/50 rounded-[18px] border border-slate-100">
              {monthlyStats.map((item: any, idx: number) => {
                const percentHeight = maxMonthlyAmount > 0 ? (item.amount / maxMonthlyAmount) * 80 : 0;
                
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 group">
                    <div className="relative w-full flex justify-center mb-1">
                      <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-all bg-slate-800 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow z-10 whitespace-nowrap">
                        ₹{item.amount.toLocaleString("en-IN")}
                      </span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${percentHeight}%` }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.04 }}
                        className="w-6 sm:w-8 bg-[#22C55E] rounded-t-lg group-hover:bg-[#16A34A] transition-colors shadow-sm"
                      />
                    </div>
                    <span className="text-[9px] font-extrabold text-slate-400 mt-1 uppercase tracking-wider">
                      {item.month.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* 5. Balances visualization ledger */}
      {balances.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-5 bg-white border-[#E2E8F0]/80 shadow-[0_8px_30px_rgba(15,23,42,0.015)] rounded-[24px]">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-4">
              Balances Ledger
            </h3>
            <div className="space-y-4">
              {balances.map((b: any, index: number) => {
                const balanceVal = b.balance || 0;
                const isOwed = balanceVal > 0;
                const isDebtor = balanceVal < 0;
                
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-slate-800">{b.name}</span>
                      <span className={`font-bold font-mono ${
                        isOwed ? "text-[#22C55E]" : isDebtor ? "text-red-500" : "text-slate-400"
                      }`}>
                        {isOwed ? `+₹${balanceVal.toLocaleString("en-IN")}` : isDebtor ? `-₹${Math.abs(balanceVal).toLocaleString("en-IN")}` : "Settled"}
                      </span>
                    </div>

                    {/* Visual indicators */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOwed ? "bg-[#22C55E] ml-auto" : isDebtor ? "bg-red-500" : "w-0"
                        }`}
                        style={{
                          width: balanceVal !== 0 
                            ? `${Math.min(Math.abs(balanceVal) / (dashboard?.totalExpenses || 1) * 100, 100)}%` 
                            : "0%"
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* 6. Recent Expenses section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="p-5 bg-white border-[#E2E8F0]/80 shadow-[0_8px_30px_rgba(15,23,42,0.015)] rounded-[24px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Recent Expenses
            </h3>
            <button
              onClick={() => navigate("/expenses")}
              className="text-xs font-bold text-[#22C55E] hover:text-[#16A34A] flex items-center gap-0.5 hover:underline"
            >
              See all
              <ChevronRight size={14} />
            </button>
          </div>

          {!recentExpenses.length ? (
            <EmptyState
              icon={Receipt}
              title="No expenses yet"
              description="Record your first shared expense to get started"
            />
          ) : (
            <div className="space-y-3.5">
              {recentExpenses.map((expense: any) => (
                <div
                  key={expense._id}
                  className="flex justify-between items-center p-3 hover:bg-slate-50 border border-slate-100 rounded-[18px] transition-colors"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate">
                      {expense.title}
                    </h4>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Paid by {expense.paidBy?.name || "Unknown"}
                    </p>
                  </div>

                  <p className="font-extrabold text-[#0F172A] font-mono text-base ml-3 shrink-0">
                    ₹{expense.amount?.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* 7. Floating Action Button (FAB) for Add Expense */}
      <div className="fixed bottom-24 right-6 sm:right-[calc(50%-17rem)] z-40">
        <button
          onClick={() => setModalOpen(true)}
          title="Add new expense"
          className="w-14 h-14 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(34,197,94,0.3)] hover:shadow-[0_8px_30px_rgba(34,197,94,0.4)] active:scale-95 transition-all text-lg font-bold"
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