import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Check, Loader2 } from "lucide-react";

import { useRoomDetails } from "../../rooms/hooks/useRoomDetails";
import { useCreateExpense } from "../hooks/useCreateExpense";
import { useUpdateExpense } from "../hooks/useUpdateExpense";
import { useAuth } from "../../../providers/AuthProvider";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  expense?: any; // populated when editing
}

const CATEGORIES = [
  "RENT",
  "FOOD",
  "UTILITIES",
  "INTERNET",
  "TRANSPORT",
  "SHOPPING",
  "OTHER",
];

export default function ExpenseModal({
  isOpen,
  onClose,
  roomId,
  expense,
}: ExpenseModalProps) {
  const { user: currentUser } = useAuth();
  const { data: roomRes, isLoading: loadingRoom } = useRoomDetails(roomId);
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  const members = roomRes?.data?.members || [];

  // Form states
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState("OTHER");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");

  // Splits state
  // Equal split: mapping memberId -> boolean (selected or not)
  const [equalSelection, setEqualSelection] = useState<Record<string, boolean>>({});
  // Custom split: mapping memberId -> custom amount (string for editing ease)
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or expense changes
  useEffect(() => {
    if (isOpen) {
      if (expense) {
        setTitle(expense.title);
        setAmount(expense.amount);
        setCategory(expense.category || "OTHER");
        setPaidBy(expense.paidBy?._id || expense.paidBy || "");
        
        // Determine split type
        // If splits are populated, check if they are equal
        const splits = expense.splits || [];
        const isCustom = splits.some(
          (s: any, idx: number) =>
            idx > 0 && Math.abs(s.amount - splits[0].amount) > 0.05
        );
        
        if (isCustom) {
          setSplitType("custom");
          const customMap: Record<string, string> = {};
          splits.forEach((s: any) => {
            const memberId = s.userId?._id || s.userId;
            customMap[memberId] = s.amount.toString();
          });
          setCustomAmounts(customMap);
        } else {
          setSplitType("equal");
          const equalMap: Record<string, boolean> = {};
          members.forEach((m: any) => {
            const memberId = m.userId?._id || m.userId;
            const inSplits = splits.some(
              (s: any) => (s.userId?._id || s.userId) === memberId
            );
            equalMap[memberId] = inSplits;
          });
          setEqualSelection(equalMap);
        }
      } else {
        // Adding new expense
        setTitle("");
        setAmount("");
        setCategory("OTHER");
        setPaidBy(currentUser?.id || "");
        setSplitType("equal");
        
        // Pre-select all members
        const equalMap: Record<string, boolean> = {};
        members.forEach((m: any) => {
          const memberId = m.userId?._id || m.userId;
          equalMap[memberId] = true;
        });
        setEqualSelection(equalMap);

        // Pre-fill custom splits equally
        setCustomAmounts({});
      }
    }
  }, [isOpen, expense, members.length]);

  // Set paidBy to current user when members load if not already set
  useEffect(() => {
    if (!paidBy && currentUser?.id) {
      setPaidBy(currentUser.id);
    }
  }, [currentUser, paidBy]);

  // Sync custom split amounts with total when amount or split type changes
  useEffect(() => {
    if (splitType === "custom" && amount && Object.keys(customAmounts).length === 0) {
      const numAmount = Number(amount);
      const share = (numAmount / (members.length || 1)).toFixed(2);
      const initialCustom: Record<string, string> = {};
      members.forEach((m: any) => {
        const memberId = m.userId?._id || m.userId;
        initialCustom[memberId] = share;
      });
      setCustomAmounts(initialCustom);
    }
  }, [amount, splitType, members]);

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;

  // Split calculations
  const selectedEqualMembersCount = Object.values(equalSelection).filter(Boolean).length;
  const equalShare = selectedEqualMembersCount > 0 ? numAmount / selectedEqualMembersCount : 0;

  const customSum = Object.values(customAmounts).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  );
  const customDiff = numAmount - customSum;
  const isCustomValid = Math.abs(customDiff) < 0.05;

  const isFormValid =
    title.trim() !== "" &&
    numAmount > 0 &&
    paidBy !== "" &&
    (splitType === "equal"
      ? selectedEqualMembersCount > 0
      : isCustomValid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    let finalSplits: Array<{ userId: string; amount: number }> = [];

    if (splitType === "equal") {
      members.forEach((m: any) => {
        const memberId = m.userId?._id || m.userId;
        if (equalSelection[memberId]) {
          finalSplits.push({
            userId: memberId,
            amount: parseFloat(equalShare.toFixed(2)),
          });
        }
      });

      // Adjust rounding discrepancy on the first split
      const totalSplitsSum = finalSplits.reduce((s, x) => s + x.amount, 0);
      if (totalSplitsSum !== numAmount && finalSplits.length > 0) {
        finalSplits[0].amount = parseFloat(
          (finalSplits[0].amount + (numAmount - totalSplitsSum)).toFixed(2)
        );
      }
    } else {
      members.forEach((m: any) => {
        const memberId = m.userId?._id || m.userId;
        const amt = parseFloat(customAmounts[memberId]) || 0;
        finalSplits.push({
          userId: memberId,
          amount: amt,
        });
      });
    }

    const payload = {
      roomId,
      title,
      amount: numAmount,
      category,
      paidBy,
      splits: finalSplits,
    };

    if (expense) {
      updateMutation.mutate(
        { expenseId: expense._id, payload },
        {
          onSuccess: () => onClose(),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onClose(),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col"
        >
          <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">
              {expense ? "Edit Expense" : "Add Expense"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <input
                type="text"
                placeholder="Electricity, Rent, Groceries..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none focus:border-green-500 transition-colors"
                required
              />
            </div>

            {/* Amount & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAmount(val === "" ? "" : Number(val));
                  }}
                  className="w-full text-sm rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none focus:border-green-500 transition-colors"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-green-500 transition-colors"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Paid By */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Paid By
              </label>
              {loadingRoom ? (
                <div className="h-10 bg-slate-50 animate-pulse rounded-xl" />
              ) : (
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-green-500 transition-colors"
                >
                  {members.map((member: any) => {
                    const memberId = member.userId?._id || member.userId;
                    const name = member.userId?.name || "Unknown";
                    return (
                      <option key={memberId} value={memberId}>
                        {memberId === currentUser?.id ? `You (${name})` : name}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Split Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Split Settings
              </label>
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSplitType("equal")}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                    splitType === "equal"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Split Equally
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType("custom")}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                    splitType === "custom"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Custom Splits
                </button>
              </div>
            </div>

            {/* Splitting lists */}
            <div className="border border-slate-100 rounded-xl p-3 max-h-[220px] overflow-y-auto bg-slate-50/50">
              {splitType === "equal" ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-medium pb-2 border-b border-slate-100">
                    <span>Who is included?</span>
                    <button
                      type="button"
                      onClick={() => {
                        const allSelected = Object.values(equalSelection).every(Boolean);
                        const updated: Record<string, boolean> = {};
                        members.forEach((m: any) => {
                          const mId = m.userId?._id || m.userId;
                          updated[mId] = !allSelected;
                        });
                        setEqualSelection(updated);
                      }}
                      className="text-green-600 hover:underline"
                    >
                      Toggle All
                    </button>
                  </div>

                  {members.map((member: any) => {
                    const memberId = member.userId?._id || member.userId;
                    const name = member.userId?.name || "Unknown";
                    const isSelected = !!equalSelection[memberId];

                    return (
                      <label
                        key={memberId}
                        className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <span className="text-sm font-medium text-slate-700">
                          {memberId === currentUser?.id ? `You (${name})` : name}
                        </span>
                        <div className="flex items-center gap-3">
                          {isSelected && numAmount > 0 && (
                            <span className="text-xs font-mono text-slate-500">
                              ₹{equalShare.toFixed(2)}
                            </span>
                          )}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) =>
                              setEqualSelection((prev) => ({
                                ...prev,
                                [memberId]: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 rounded text-green-600 focus:ring-green-500 accent-green-600"
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400 font-medium pb-1.5 border-b border-slate-100">
                    Enter individual share amounts:
                  </div>

                  {members.map((member: any) => {
                    const memberId = member.userId?._id || member.userId;
                    const name = member.userId?.name || "Unknown";
                    const val = customAmounts[memberId] || "";

                    return (
                      <div
                        key={memberId}
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="text-sm font-medium text-slate-700 truncate">
                          {memberId === currentUser?.id ? `You (${name})` : name}
                        </span>
                        <div className="relative shrink-0 w-28">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={val}
                            onChange={(e) =>
                              setCustomAmounts((prev) => ({
                                ...prev,
                                [memberId]: e.target.value,
                              }))
                            }
                            className="w-full text-right text-sm rounded-lg border border-slate-200 bg-white pl-6 pr-2.5 py-1.5 outline-none focus:border-green-500 transition-colors"
                            min="0"
                            step="any"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Validation Info (Equal count or Custom match sum) */}
            {numAmount > 0 && (
              <div className="flex items-center justify-between text-xs font-semibold p-3.5 rounded-xl bg-slate-100 text-slate-700">
                {splitType === "equal" ? (
                  <>
                    <span>Splitting between {selectedEqualMembersCount} member(s)</span>
                    <span className="font-mono text-green-600">
                      ₹{equalShare.toFixed(2)} each
                    </span>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      {isCustomValid ? (
                        <>
                          <Check size={14} className="text-green-600" />
                          <span className="text-green-600">Splits match total</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={14} className="text-red-500" />
                          <span className="text-red-500">
                            {customDiff > 0
                              ? `₹${customDiff.toFixed(2)} left to split`
                              : `₹${Math.abs(customDiff).toFixed(2)} over-allocated`}
                          </span>
                        </>
                      )}
                    </span>
                    <span className="font-mono">
                      ₹{customSum.toFixed(2)} of ₹{numAmount}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isPending}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow"
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                {expense ? "Save Changes" : "Add Expense"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
