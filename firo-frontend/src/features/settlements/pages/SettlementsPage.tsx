import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, Check } from "lucide-react";

import Button from "../../../components/ui/Button";
import Card, { CardContent } from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import { Skeleton } from "../../../components/ui/Skeleton";

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

  return (
    <div className="w-full py-8 px-2 space-y-8">
      {/* Header Context */}
      <div className="pl-0.5">
        <span className="text-[10px] font-bold tracking-widest text-[#22C55E] uppercase pl-0.5">
          {room?.roomName}
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 mt-1">
          Settlements
        </h1>
      </div>

      {/* Loading states */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : settlements.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="All settled up"
          description="Awesome! There are no outstanding roommate debts inside this room."
        />
      ) : (
        <div className="space-y-8">
          {/* 1. Debt relationships first focus */}
          <div className="space-y-3.5">
            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase pl-0.5">
              Active Room Debts
            </span>

            <Card>
              <CardContent className="p-0 divide-y divide-zinc-150">
                {settlements.map((settlement: any, index: number) => (
                  <div
                    key={settlement._id || index}
                    className="flex items-center justify-between p-5"
                  >
                    <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-[#EF4444] text-sm">
                        {settlement.from?.name}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-0.5 pr-0.5">
                        owes
                      </span>
                      <span className="font-extrabold text-[#22C55E] text-sm">
                        {settlement.to?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <p className="font-extrabold text-zinc-900 font-mono text-base">
                        ₹{settlement.amount?.toLocaleString("en-IN")}
                      </p>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSettleClick(settlement)}
                        className="font-bold h-9"
                      >
                        Settle
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 2. Roommates balances summary */}
          {balances.length > 0 && (
            <div className="space-y-3.5">
              <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase pl-0.5">
                Balances Summary
              </span>

              <Card>
                <CardContent className="p-0 divide-y divide-zinc-150">
                  {balances.map((b: any, bIdx: number) => {
                    const isOwed = b.balance > 0;
                    const isDebtor = b.balance < 0;

                    return (
                      <div key={bIdx} className="flex justify-between items-center p-5">
                        <span className="text-sm font-bold text-zinc-800">{b.name}</span>
                        <span
                          className={`font-bold font-mono text-sm ${
                            isOwed ? "text-[#22C55E]" : isDebtor ? "text-[#EF4444]" : "text-zinc-450"
                          }`}
                        >
                          {isOwed ? `+₹${b.balance.toLocaleString("en-IN")}` : isDebtor ? `-₹${Math.abs(b.balance).toLocaleString("en-IN")}` : "Settled"}
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

      {/* Record payment Dialog */}
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
              className="relative bg-white w-full max-w-sm rounded-[20px] shadow-xl p-6 overflow-hidden border border-zinc-150"
            >
              <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-zinc-100">
                <h3 className="text-base font-extrabold text-[#0F172A]">
                  Record Settlement
                </h3>
                <button
                  onClick={() => setSelectedSettlement(null)}
                  className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-lg hover:bg-zinc-50 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSettleSubmit} className="space-y-4">
                <div className="text-sm text-zinc-650 font-semibold leading-relaxed">
                  Record a payment from <strong className="text-[#0F172A]">{selectedSettlement.from.name}</strong> to <strong className="text-[#0F172A]">{selectedSettlement.to.name}</strong>.
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 pl-0.5">
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full text-sm font-semibold rounded-lg border border-zinc-200 bg-white px-4 py-2.5 outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-zinc-950 transition-all"
                    required
                    min="1"
                    step="any"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setSelectedSettlement(null)}
                    disabled={createMutation.isPending}
                    className="text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!settleAmount || createMutation.isPending}
                    loading={createMutation.isPending}
                    className="font-bold flex items-center gap-1"
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
