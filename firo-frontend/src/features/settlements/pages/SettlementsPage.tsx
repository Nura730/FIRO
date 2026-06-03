import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, Wallet, X, Check, Loader2 } from "lucide-react";

import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import PageHeader from "../../../components/layout/PageHeader";

import { useRoom } from "../../../providers/RoomProvider";
import { useSettlements } from "../hooks/useSettlements";
import { useCreateExpense } from "../../expenses/hooks/useCreateExpense";

export default function SettlementsPage() {
  const { room } = useRoom();
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
      },
    });
  };

  return (
    <div className="py-6 space-y-5 pb-24 max-w-xl mx-auto w-full">
      <PageHeader title="Settlements" subtitle={room?.roomName} />

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : settlements.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="All settled up!"
          description="No pending debts in this room."
        />
      ) : (
        <div className="space-y-5">
          {/* Balance Overview Panel */}
          {balances.length > 0 && (
            <Card className="p-5 bg-white border-[#E2E8F0]/80 shadow-[0_8px_30px_rgba(15,23,42,0.01)] rounded-[24px]">
              <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3 pl-1">
                Balances Summary
              </h3>
              <div className="space-y-3">
                {balances.map((b: any, bIdx: number) => {
                  const isOwed = b.balance > 0;
                  const isDebtor = b.balance < 0;
                  
                  return (
                    <div key={bIdx} className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-[#0F172A]">{b.name}</span>
                      <span className={`font-bold font-mono ${
                        isOwed ? "text-[#22C55E]" : isDebtor ? "text-[#EF4444]" : "text-slate-400"
                      }`}>
                        {isOwed ? `+₹${b.balance.toLocaleString("en-IN")}` : isDebtor ? `-₹${Math.abs(b.balance).toLocaleString("en-IN")}` : "Settled"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Recommendations List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider pl-1">
              Active settlement paths
            </h3>
            
            {settlements.map((settlement: any, index: number) => (
              <motion.div
                key={settlement._id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="p-5 bg-white border-[#E2E8F0]/80 shadow-[0_8px_30px_rgba(15,23,42,0.01)] rounded-[24px] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#EF4444]/10 flex items-center justify-center shrink-0 border border-[#EF4444]/15">
                        <span className="text-sm font-extrabold text-[#EF4444]">
                          {settlement.from?.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-bold text-[#0F172A] truncate">
                          {settlement.from?.name || "Unknown"}
                        </span>
                        
                        <ArrowRight size={14} className="text-[#64748B] shrink-0" />
                        
                        <span className="text-sm font-bold text-[#0F172A] truncate">
                          {settlement.to?.name || "Unknown"}
                        </span>
                      </div>

                      <div className="w-9 h-9 rounded-xl bg-[#22C55E]/10 flex items-center justify-center shrink-0 border border-[#22C55E]/15">
                        <span className="text-sm font-extrabold text-[#22C55E]">
                          {settlement.to?.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right ml-3 shrink-0">
                      <p className="font-extrabold text-[#0F172A] font-mono text-base">
                        ₹{settlement.amount?.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleSettleClick(settlement)}
                      className="flex items-center gap-1.5 bg-[#22C55E]/10 hover:bg-[#22C55E]/20 text-[#22C55E] text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95"
                    >
                      <Wallet size={13} />
                      Record Settlement
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Settle Up payment dialog (Modal 20px rounded) */}
      <AnimatePresence>
        {selectedSettlement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSettlement(null)}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white w-full max-w-sm rounded-[20px] shadow-xl p-6 overflow-hidden border border-[#E2E8F0]"
            >
              <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-slate-100">
                <h3 className="text-base font-bold text-[#0F172A]">
                  Record Settlement
                </h3>
                <button
                  onClick={() => setSelectedSettlement(null)}
                  className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-lg hover:bg-slate-100 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSettleSubmit} className="space-y-4">
                <div className="text-sm text-[#64748B] font-medium leading-relaxed">
                  Record a payment from <strong className="text-[#0F172A]">{selectedSettlement.from.name}</strong> to <strong className="text-[#0F172A]">{selectedSettlement.to.name}</strong>.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 outline-none focus:border-[#22C55E] transition-colors"
                    required
                    min="1"
                    step="any"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedSettlement(null)}
                    className="text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors px-2 py-1"
                    disabled={createMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!settleAmount || createMutation.isPending}
                    className="flex items-center gap-1.5 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    {createMutation.isPending ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Check size={13} />
                    )}
                    Record Payment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
