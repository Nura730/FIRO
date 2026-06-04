import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, Check } from "lucide-react";

import Button from "../../../components/ui/Button";
import Card, { CardContent } from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import { Skeleton } from "../../../components/ui/Skeleton";
import Input from "../../../components/ui/Input";

import { useRoom } from "../../../providers/RoomProvider";
import { useSettlements } from "../hooks/useSettlements";
import { useCreateExpense } from "../../expenses/hooks/useCreateExpense";
import { useToast } from "../../../providers/ToastProvider";

export default function SettlementsPage() {
  const { room } = useRoom();
  const { showToast } = useToast();
  const roomId = room?.roomId || "";
  const { data, isLoading } = useSettlements(roomId);
  const createMutation = useCreateExpense();

  const settlements = data?.data?.settlements || [];
  const balances = data?.data?.balances || [];

  // Settle up modal state
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null);
  const [settleAmount, setSettleAmount] = useState<number | "">("");

  const handleSettleClick = (settlement: any) => {
    setSelectedSettlement(settlement);
    setSettleAmount(settlement.amount);
  };

  const handleSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSettlement || !settleAmount) return;

    const payload = {
      roomId,
      title: `Settled payment: ${selectedSettlement.from.name} to ${selectedSettlement.to.name}`,
      amount: Number(settleAmount),
      category: "OTHER",
      paidBy: selectedSettlement.from.id,
      isSettlement: true,
      splits: [
        {
          userId: selectedSettlement.to.id,
          amount: Number(settleAmount),
        },
      ],
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        setSelectedSettlement(null);
        showToast("Settlement payment recorded successfully", "success");
      },
      onError: () => {
        showToast("Failed to record settlement", "error");
      },
    });
  };

  // Avatar Initials Helpers
  const getAvatarStyle = (name: string) => {
    const colors = [
      "from-emerald-500/20 to-teal-500/10 text-emerald-450 border-emerald-500/20",
      "from-indigo-500/20 to-purple-500/10 text-indigo-400 border-indigo-500/20",
      "from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/20",
      "from-pink-500/20 to-rose-500/10 text-pink-400 border-rose-500/20",
      "from-amber-500/20 to-orange-500/10 text-amber-450 border-amber-500/20",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-12">
      {/* Header Context */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="pl-1"
      >
        <span className="text-[10px] font-black tracking-[0.25em] text-emerald-450 uppercase pl-0.5">
          {room?.roomName}
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mt-0.5 font-heading">
          Room Settlements
        </h1>
      </motion.div>

      {/* Loading states */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-[20px]" />
          ))}
        </div>
      ) : settlements.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="All settled up"
          description="Awesome! There are no outstanding roommate debts inside this room ledger."
        />
      ) : (
        <div className="space-y-6">
          {/* 1. Debt relationships first focus */}
          <div className="space-y-3">
            <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase pl-1">
              Active Room Debts
            </span>

            <Card className="border border-white/10 bg-white/[0.02] shadow-[0_15px_35px_rgba(0,0,0,0.3)]">
              <CardContent className="p-0 divide-y divide-white/[0.05]">
                {settlements.map((settlement: any, index: number) => {
                  const fromAvatar = getAvatarStyle(settlement.from?.name || "");
                  const toAvatar = getAvatarStyle(settlement.to?.name || "");

                  return (
                    <div
                      key={settlement._id || index}
                      className="flex items-center justify-between p-4.5 border-b border-white/[0.02] last:border-b-0"
                    >
                      {/* GPay Transfer Visual Row */}
                      <div className="flex items-center gap-1.5 min-w-0 max-w-[65%] flex-1">
                        {/* Debtor */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[9px] bg-gradient-to-tr border ${fromAvatar} border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.05)]`}>
                            {getInitials(settlement.from?.name || "")}
                          </div>
                          <span className="text-xs font-bold text-rose-350 truncate max-w-[50px]">
                            {settlement.from?.name}
                          </span>
                        </div>

                        {/* Animated dotted flow line */}
                        <div className="flex-1 h-[2px] relative overflow-hidden bg-white/5 mx-1 flex items-center rounded-full">
                          <motion.div
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                            className="absolute h-full w-8 bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
                          />
                        </div>

                        {/* Creditor */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[9px] bg-gradient-to-tr border ${toAvatar} border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.05)]`}>
                            {getInitials(settlement.to?.name || "")}
                          </div>
                          <span className="text-xs font-bold text-emerald-450 truncate max-w-[50px]">
                            {settlement.to?.name}
                          </span>
                        </div>
                      </div>

                      {/* Right amount and settle button */}
                      <div className="flex items-center gap-2.5 shrink-0 ml-2">
                        <p className="font-extrabold text-white font-mono text-sm">
                          ₹{settlement.amount?.toLocaleString("en-IN")}
                        </p>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSettleClick(settlement)}
                          className="h-8 px-2.5 rounded-lg text-xs font-bold"
                        >
                          Settle
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* 2. Roommates balances summary */}
          {balances.length > 0 && (
            <div className="space-y-3">
              <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase pl-1">
                Balances Summary
              </span>

              <Card className="border border-white/10 bg-white/[0.02] shadow-[0_15px_35px_rgba(0,0,0,0.3)]">
                <CardContent className="p-0 divide-y divide-white/[0.05]">
                  {balances.map((b: any, bIdx: number) => {
                    const isOwed = b.balance > 0;
                    const isDebtor = b.balance < 0;
                    const avatarStyle = getAvatarStyle(b.name || "");

                    return (
                      <div key={bIdx} className="flex justify-between items-center p-4.5 border-b border-white/[0.02] last:border-b-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[9px] bg-gradient-to-tr border ${avatarStyle}`}>
                            {getInitials(b.name || "")}
                          </div>
                          <span className="text-sm font-bold text-slate-200 truncate">{b.name}</span>
                        </div>

                        <span
                          className={`font-bold font-mono text-sm ${
                            isOwed 
                              ? "text-emerald-400" 
                              : isDebtor 
                              ? "text-rose-455" 
                              : "text-slate-450"
                          }`}
                        >
                          {isOwed 
                            ? `+₹${b.balance.toLocaleString("en-IN")}` 
                            : isDebtor 
                            ? `-₹${Math.abs(b.balance).toLocaleString("en-IN")}` 
                            : "Settled"}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Record payment Dialog Modal */}
      <AnimatePresence>
        {selectedSettlement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSettlement(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            {/* Card modal container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative glass-panel w-full max-w-sm rounded-[28px] overflow-hidden border border-white/10 z-10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[80vh]"
            >
              {/* Header (Fixed) */}
              <div className="flex justify-between items-center px-6 py-4.5 border-b border-white/[0.06] shrink-0">
                <h3 className="text-base font-bold text-white tracking-tight font-heading">
                  Record Settlement
                </h3>
                <button
                  onClick={() => setSelectedSettlement(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/5 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSettleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                  <div className="text-xs font-semibold text-slate-350 leading-relaxed bg-[#0b071a] p-3.5 border border-white/5 rounded-2xl">
                    Record a direct payment from <strong className="text-rose-400 font-bold">{selectedSettlement.from.name}</strong> to <strong className="text-emerald-450 font-bold">{selectedSettlement.to.name}</strong>.
                  </div>

                  <Input
                    label="Amount Paid (₹)"
                    type="number"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    startIcon={<span className="text-emerald-400 text-xs font-black">₹</span>}
                    required
                    min="1"
                    step="any"
                  />
                </div>

                {/* Actions Footer (Fixed) */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.06] bg-black/20 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedSettlement(null)}
                    disabled={createMutation.isPending}
                    className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  
                  <Button
                    type="submit"
                    disabled={!settleAmount || createMutation.isPending}
                    loading={createMutation.isPending}
                    className="h-10 px-4 rounded-xl text-xs font-bold"
                  >
                    <Check size={13} />
                    Record Payment
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
