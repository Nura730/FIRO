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

    // Create a special isSettlement expense on backend
    // Paid by the debtor (from), split 100% to the creditor (to)
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
    <div className="p-4 max-w-xl mx-auto pb-24">
      <PageHeader title="Settlements" subtitle={room?.roomName} />

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : settlements.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="All settled up!"
          description="No pending settlements in this room"
        />
      ) : (
        <div className="space-y-4">
          {/* Balance Overview Panel */}
          {balances.length > 0 && (
            <Card className="p-4 bg-slate-50 border-slate-100">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                Balances summary
              </h3>
              <div className="space-y-2">
                {balances.map((b: any, bIdx: number) => {
                  const isOwed = b.balance > 0;
                  const isDebtor = b.balance < 0;
                  
                  return (
                    <div key={bIdx} className="flex justify-between items-center text-sm font-medium">
                      <span className="text-slate-800">{b.name}</span>
                      <span className={`font-bold font-mono ${
                        isOwed ? "text-green-600" : isDebtor ? "text-red-500" : "text-slate-500"
                      }`}>
                        {isOwed ? `+₹${b.balance}` : isDebtor ? `-₹${Math.abs(b.balance)}` : "Settled"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Recommendations List */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Payments
            </h3>
            
            {settlements.map((settlement: any, index: number) => (
              <motion.div
                key={settlement._id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-red-500">
                          {settlement.from?.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {settlement.from?.name || "Unknown"}
                        </span>
                        
                        <ArrowRight size={13} className="text-slate-400 shrink-0" />
                        
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {settlement.to?.name || "Unknown"}
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-green-500">
                          {settlement.to?.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right ml-3 shrink-0">
                      <p className="font-extrabold text-slate-900 text-lg">
                        ₹{settlement.amount?.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleSettleClick(settlement)}
                      className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold px-3 py-1.8 rounded-lg border border-green-200 transition-colors"
                    >
                      <Wallet size={13} />
                      Settle Up
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Settle Up payment dialog */}
      <AnimatePresence>
        {selectedSettlement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSettlement(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl p-5 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-955">
                  Record Settlement
                </h3>
                <button
                  onClick={() => setSelectedSettlement(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSettleSubmit} className="space-y-4">
                <div className="text-sm text-slate-600 leading-relaxed">
                  Record a payment of <strong className="text-slate-900">{selectedSettlement.from.name}</strong> to <strong className="text-slate-900">{selectedSettlement.to.name}</strong>.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-200 bg-white px-3.5 py-2Outline-none focus:border-green-500 transition-colors"
                    required
                    min="1"
                    step="any"
                  />
                </div>

                <div className="flex justify-end gap-3.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedSettlement(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    disabled={createMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!settleAmount || createMutation.isPending}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
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
