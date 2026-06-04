import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Check, Receipt } from "lucide-react";

import { useRoomDetails } from "../../rooms/hooks/useRoomDetails";
import { useCreateExpense } from "../hooks/useCreateExpense";
import { useUpdateExpense } from "../hooks/useUpdateExpense";
import { useAuth } from "../../../providers/AuthProvider";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

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

  // Initials Avatar Helpers
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal panel container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative glass-panel w-full max-w-md rounded-[28px] overflow-hidden max-h-[80vh] flex flex-col border border-white/10 z-10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* Header (Fixed) */}
          <div className="flex justify-between items-center px-6 py-4.5 border-b border-white/[0.06] shrink-0">
            <h2 className="text-lg font-bold text-white tracking-tight font-heading">
              {expense ? "Edit Room Expense" : "Add Room Expense"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {/* Title / Description */}
              <Input
                label="Description"
                type="text"
                placeholder="Electricity, Rent, Groceries..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                startIcon={<Receipt size={15} className="text-emerald-450" />}
                required
              />

              {/* Amount & Category */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Amount (₹)"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAmount(val === "" ? "" : Number(val));
                  }}
                  startIcon={<span className="text-emerald-450 text-xs font-black">₹</span>}
                  required
                  min="1"
                />

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-13 text-sm font-bold rounded-2xl border border-white/8 bg-[#0b071a] px-4 py-2.5 text-white outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0c091f] text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Paid By */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Paid By
                </label>
                {loadingRoom ? (
                  <div className="h-13 bg-white/5 animate-pulse rounded-2xl" />
                ) : (
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full h-13 text-sm font-bold rounded-2xl border border-white/8 bg-[#0b071a] px-4 py-2.5 text-white outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 cursor-pointer"
                  >
                    {members.map((member: any) => {
                      const memberId = member.userId?._id || member.userId;
                      const name = member.userId?.name || "Unknown";
                      return (
                        <option key={memberId} value={memberId} className="bg-[#0c091f] text-white">
                          {memberId === currentUser?.id ? `You (${name})` : name}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* Split Switcher Tabs */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Split Settings
                </label>
                <div className="grid grid-cols-2 p-1.5 bg-[#0b071a] border border-white/5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setSplitType("equal")}
                    className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      splitType === "equal"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Split Equally
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitType("custom")}
                    className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      splitType === "custom"
                        ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Custom Splits
                  </button>
                </div>
              </div>

              {/* Splitting Checklists / Inputs List Box */}
              <div className="border border-white/5 rounded-2xl p-3.5 max-h-[200px] overflow-y-auto bg-white/[0.01] no-scrollbar">
                {splitType === "equal" ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-white/[0.06]">
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
                        className="text-emerald-450 hover:underline cursor-pointer normal-case"
                      >
                        Toggle All
                      </button>
                    </div>

                    {members.map((member: any) => {
                      const memberId = member.userId?._id || member.userId;
                      const name = member.userId?.name || "Unknown";
                      const isSelected = !!equalSelection[memberId];
                      const avatarStyle = getAvatarStyle(name);

                      return (
                        <label
                          key={memberId}
                          className="flex items-center justify-between p-1.5 hover:bg-white/5 rounded-xl cursor-pointer transition-colors border-b border-white/[0.02] last:border-b-0"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Initials Avatar Badge */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold bg-gradient-to-tr border ${avatarStyle}`}>
                              {getInitials(name)}
                            </div>
                            <span className="text-xs font-bold text-slate-200 truncate">
                              {memberId === currentUser?.id ? `You (${name})` : name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {isSelected && numAmount > 0 && (
                              <span className="text-xs font-bold font-mono text-slate-400">
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
                              className="w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/25 accent-emerald-500 cursor-pointer"
                            />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1.5 border-b border-white/[0.06]">
                      Enter individual share amounts:
                    </div>

                    {members.map((member: any) => {
                      const memberId = member.userId?._id || member.userId;
                      const name = member.userId?.name || "Unknown";
                      const val = customAmounts[memberId] || "";
                      const avatarStyle = getAvatarStyle(name);

                      return (
                        <div
                          key={memberId}
                          className="flex items-center justify-between gap-4 py-1 border-b border-white/[0.02] last:border-b-0"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold bg-gradient-to-tr border ${avatarStyle}`}>
                              {getInitials(name)}
                            </div>
                            <span className="text-xs font-bold text-slate-200 truncate">
                              {memberId === currentUser?.id ? `You (${name})` : name}
                            </span>
                          </div>
                          <div className="relative shrink-0 w-28">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
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
                              className="w-full text-right text-xs font-semibold font-mono rounded-lg border border-white/10 bg-white/[0.03] pl-6 pr-2.5 py-1.5 outline-none focus:border-emerald-500/50 transition-colors"
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

              {/* Form Calculations and Validations Info */}
              {numAmount > 0 && (
                <div className="flex items-center justify-between text-xs font-bold p-3.5 rounded-2xl bg-white/5 border border-white/5 text-slate-350">
                  {splitType === "equal" ? (
                    <>
                      <span>Splitting among {selectedEqualMembersCount} member(s)</span>
                      <span className="font-mono text-emerald-450">
                        ₹{equalShare.toFixed(2)} each
                      </span>
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        {isCustomValid ? (
                          <>
                            <Check size={14} className="text-emerald-400 stroke-[3]" />
                            <span className="text-emerald-400">Amounts match total</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={14} className="text-rose-450" />
                            <span className="text-rose-455">
                              {customDiff > 0
                                ? `₹${customDiff.toFixed(2)} remaining`
                                : `₹${Math.abs(customDiff).toFixed(2)} over limit`}
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
            </div>

            {/* Modal Actions Footer (Fixed) */}
            <div className="flex justify-end gap-3 px-6 py-4.5 border-t border-white/[0.06] bg-black/20 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                disabled={isPending}
              >
                Cancel
              </button>
              
              <Button
                type="submit"
                disabled={!isFormValid || isPending}
                loading={isPending}
                className="h-11 px-5 rounded-xl text-xs font-bold"
              >
                {expense ? "Save Changes" : "Add Expense"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
