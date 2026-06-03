import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Receipt, Copy, Check, TrendingUp, Users, ArrowUpRight, DollarSign } from "lucide-react";

import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import { CardSkeleton, Skeleton } from "../../../components/ui/Skeleton";
import PageHeader from "../../../components/layout/PageHeader";

import { useRoom } from "../../../providers/RoomProvider";
import { useDashboard } from "../hooks/useDashboard";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { room } = useRoom();
  const roomId = room?.roomId || "";
  const { data, isLoading } = useDashboard(roomId);
  const [copied, setCopied] = useState(false);

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

  // Calculate highest monthly spending for scaling chart bars
  const maxMonthlyAmount = useMemo(() => {
    if (!monthlyStats.length) return 0;
    return Math.max(...monthlyStats.map((item: any) => item.amount));
  }, [monthlyStats]);

  if (isLoading) {
    return (
      <div className="p-4 max-w-xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <PageHeader
        title={dashboard?.roomName || room.roomName}
        subtitle="Active roommate balances & stats"
        right={
          <button
            onClick={handleCopyCode}
            title="Click to copy invite code"
            className="flex items-center gap-1.5 text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 px-3.5 py-2.5 rounded-xl transition-all border border-slate-200"
          >
            {copied ? (
              <>
                <Check size={14} className="text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>{room.inviteCode}</span>
              </>
            )}
          </button>
        }
      />

      {/* 2x2 Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-md">
            <div className="flex justify-between items-start opacity-90">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Expenses</span>
              <DollarSign size={16} />
            </div>
            <h2 className="text-2xl font-black mt-2 font-mono">
              ₹{(dashboard?.totalExpenses || 0).toLocaleString("en-IN")}
            </h2>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Roommates</span>
              <Users size={16} />
            </div>
            <h2 className="text-2xl font-black mt-2 text-slate-800 font-mono">
              {dashboard?.memberCount || 0}
            </h2>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-4 hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Bills Logged</span>
              <Receipt size={16} />
            </div>
            <h2 className="text-2xl font-black mt-2 text-slate-800 font-mono">
              {dashboard?.expenseCount || 0}
            </h2>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending debts</span>
              <TrendingUp size={16} />
            </div>
            <h2 className="text-2xl font-black mt-2 text-slate-800 font-mono">
              {dashboard?.totalSettlements || 0}
            </h2>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Expense Chart */}
      {monthlyStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-1.5">
              <TrendingUp size={16} className="text-green-600" />
              Monthly Spending Trend
            </h3>
            
            {/* Chart Area */}
            <div className="flex items-end justify-between h-36 pt-4 px-2 bg-slate-50/50 rounded-xl border border-slate-100">
              {monthlyStats.map((item: any, idx: number) => {
                const percentHeight = maxMonthlyAmount > 0 ? (item.amount / maxMonthlyAmount) * 100 : 0;
                
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 group">
                    <div className="relative w-full flex justify-center mb-1">
                      {/* Tooltip on hover */}
                      <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-all bg-slate-800 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-10">
                        ₹{item.amount.toLocaleString("en-IN")}
                      </span>
                      {/* Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${percentHeight}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.05 }}
                        className="w-7 sm:w-9 bg-green-500 rounded-t-md group-hover:bg-green-600 transition-colors shadow-sm"
                      />
                    </div>
                    {/* Month label */}
                    <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      {item.month.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Roommates Balances visualization ledger */}
      {balances.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Balances Ledger
            </h3>
            <div className="space-y-4">
              {balances.map((b: any, index: number) => {
                const balanceVal = b.balance || 0;
                const isOwed = balanceVal > 0;
                const isDebtor = balanceVal < 0;
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-slate-800 font-bold">{b.name}</span>
                      <span className={`font-black font-mono ${
                        isOwed ? "text-green-600" : isDebtor ? "text-red-500" : "text-slate-400"
                      }`}>
                        {isOwed ? `Owed: +₹${balanceVal.toLocaleString("en-IN")}` : isDebtor ? `Owes: -₹${Math.abs(balanceVal).toLocaleString("en-IN")}` : "Settled"}
                      </span>
                    </div>

                    {/* Progress visual indicator bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOwed ? "bg-green-500 ml-auto w-1/2" : isDebtor ? "bg-red-500 w-1/2" : "w-0"
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

      {/* Recent Expenses list */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent Expenses
            </h3>
            <button
              onClick={() => navigate("/expenses")}
              className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-0.5 hover:underline"
            >
              See all
              <ArrowUpRight size={14} />
            </button>
          </div>

          {!recentExpenses.length ? (
            <EmptyState
              icon={Receipt}
              title="No expenses yet"
              description="Add expenses on the Expenses tab to see them here"
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentExpenses.map((expense: any) => (
                <div
                  key={expense._id}
                  className="flex justify-between items-center py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-800 text-sm truncate">
                      {expense.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Paid by {expense.paidBy?.name || "Unknown"}
                    </p>
                  </div>

                  <p className="font-extrabold text-slate-900 font-mono text-sm ml-3 shrink-0">
                    ₹{expense.amount?.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}