import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Receipt, Search, Edit2, Trash2, ChevronDown, ChevronUp, 
  Home, Utensils, Zap, Wifi, Car, ShoppingBag, DollarSign 
} from "lucide-react";

import Button from "../../../components/ui/Button";
import Card, { CardContent } from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import EmptyState from "../../../components/ui/EmptyState";
import { Skeleton } from "../../../components/ui/Skeleton";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import ExpenseModal from "../components/ExpenseModal";

import { useRoom } from "../../../providers/RoomProvider";
import { useExpenses } from "../hooks/useExpenses";
import { useDeleteExpense } from "../hooks/useDeleteExpense";
import { useAuth } from "../../../providers/AuthProvider";
import { useToast } from "../../../providers/ToastProvider";

const CATEGORIES = ["ALL", "RENT", "FOOD", "UTILITIES", "INTERNET", "TRANSPORT", "SHOPPING", "OTHER"];

const categoryIcons: Record<string, any> = {
  RENT: Home,
  FOOD: Utensils,
  UTILITIES: Zap,
  INTERNET: Wifi,
  TRANSPORT: Car,
  SHOPPING: ShoppingBag,
  OTHER: DollarSign,
};

const categoryColors: Record<string, string> = {
  RENT: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.06)]",
  FOOD: "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.06)]",
  UTILITIES: "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.06)]",
  INTERNET: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.06)]",
  TRANSPORT: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.06)]",
  SHOPPING: "bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.06)]",
  OTHER: "bg-slate-500/10 text-slate-400 border-slate-500/20 shadow-[0_0_15px_rgba(100,116,139,0.06)]",
};

const categoryVerticalBar: Record<string, string> = {
  RENT: "bg-blue-500",
  FOOD: "bg-orange-500",
  UTILITIES: "bg-purple-500",
  INTERNET: "bg-indigo-500",
  TRANSPORT: "bg-cyan-500",
  SHOPPING: "bg-pink-500",
  OTHER: "bg-slate-500",
};

export default function ExpensesPage() {
  const { user: currentUser } = useAuth();
  const { room } = useRoom();
  const { showToast } = useToast();
  const roomId = room?.roomId || "";
  const { data, isLoading } = useExpenses(roomId);
  const deleteMutation = useDeleteExpense();

  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);

  // Custom confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const expenses = data?.data || [];

  const nonSettlementExpenses = useMemo(() => {
    return expenses.filter((e: any) => !e.isSettlement);
  }, [expenses]);

  const filtered = useMemo(() => {
    let result = nonSettlementExpenses;

    if (selectedCategory !== "ALL") {
      result = result.filter((e: any) => e.category === selectedCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e: any) =>
        e.title.toLowerCase().includes(q)
      );
    }

    return result;
  }, [nonSettlementExpenses, selectedCategory, search]);

  const handleDeleteTrigger = (expenseId: string) => {
    setDeleteTargetId(expenseId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    deleteMutation.mutate(deleteTargetId, {
      onSuccess: () => showToast("Expense deleted successfully", "success"),
      onError: () => showToast("Failed to delete expense", "error"),
    });
    setDeleteTargetId(null);
  };

  const handleEditClick = (e: React.MouseEvent, expense: any) => {
    e.stopPropagation();
    setSelectedExpense(expense);
    setModalOpen(true);
  };

  const handleRowClick = (expenseId: string) => {
    setExpandedExpenseId((prev) => (prev === expenseId ? null : expenseId));
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
      {/* 1. Header & Search Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="flex justify-between items-center pl-1"
      >
        <div>
          <span className="text-[10px] font-black tracking-[0.25em] text-emerald-450 uppercase pl-0.5">
            {room?.roomName}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-0.5 font-heading">
            Room Expenses
          </h1>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setSearchOpen(!searchOpen)}
          className={`h-11 w-11 rounded-full border-white/5 bg-white/3 text-slate-400 transition-all ${
            searchOpen ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : ""
          }`}
        >
          <Search size={16} />
        </Button>
      </motion.div>

      {/* 2. Collapsible Search Box */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden px-0.5"
          >
            <Input
              placeholder="Search expenses by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startIcon={<Search className="text-emerald-400 w-4 h-4" />}
              className="h-12 border-white/10 bg-white/3"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Category horizontal chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-full border transition-all active:scale-95 cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 border-emerald-500/20 text-white shadow-md shadow-emerald-500/10"
                  : "bg-white/3 border-white/5 text-slate-400 hover:text-white hover:border-white/10"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 4. Vertical List of Expenses */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-[20px]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={search || selectedCategory !== "ALL" ? "No matches found" : "No expenses recorded"}
          description={
            search || selectedCategory !== "ALL"
              ? "Try adjusting your search criteria or filter options."
              : "All roommate split bills and expense items will appear here."
          }
        />
      ) : (
        <Card className="border-white/10 bg-white/[0.02] shadow-[0_15px_35px_rgba(0,0,0,0.3)]">
          <CardContent className="p-0 divide-y divide-white/[0.05]">
            {filtered.map((expense: any) => {
              const isExpanded = expandedExpenseId === expense._id;
              const creatorId = expense.createdBy?._id || expense.createdBy;
              const canManage = currentUser?.id === creatorId;
              const dateStr = expense.createdAt
                ? new Date(expense.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })
                : "";

              const IconComponent = categoryIcons[expense.category] || categoryIcons.OTHER;
              const badgeStyle = categoryColors[expense.category] || categoryColors.OTHER;
              const verticalBarClass = categoryVerticalBar[expense.category] || "bg-slate-500";

              return (
                <div
                  key={expense._id}
                  onClick={() => handleRowClick(expense._id)}
                  className="p-4.5 cursor-pointer hover:bg-white/[0.03] transition-colors border-b border-white/[0.02] last:border-b-0 relative overflow-hidden"
                >
                  {/* Category Accent Indicator Strip on the left edge */}
                  <div className={`absolute left-0 top-0 bottom-0 w-[3.5px] ${verticalBarClass}`} />

                  <div className="flex justify-between items-center pl-1.5">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Apple style badge icons */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${badgeStyle}`}>
                        <IconComponent size={18} className="stroke-[1.75]" />
                      </div>

                      {/* Expense details */}
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-bold text-white text-sm truncate">
                          {expense.title}
                        </h4>
                        <p className="text-xs text-slate-405 font-semibold">
                          Paid by {expense.paidBy?.name || "Unknown"} • {dateStr}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 ml-3">
                      <p className="font-bold text-white font-mono text-sm">
                        ₹{expense.amount?.toLocaleString("en-IN")}
                      </p>
                      <span className="text-slate-400 hover:text-white transition-colors">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    </div>
                  </div>

                  {/* Expand Splits Breakdowns */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden mt-4 pt-4 border-t border-white/[0.06] pl-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-4">
                          {/* Mini digital receipt container */}
                          <div className="bg-[#080517] border border-white/5 rounded-2xl p-4.5 space-y-3.5 shadow-inner relative overflow-hidden">
                            {/* Receipt dotted decorative accent */}
                            <div className="absolute top-0 inset-x-0 h-1 flex justify-between overflow-hidden opacity-25">
                              {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map((x) => (
                                <div key={x} className="w-2 h-2 rounded-full bg-white -mt-1" />
                              ))}
                            </div>

                            <span className="block text-[8px] font-black tracking-widest text-slate-450 uppercase pl-0.5 pt-1">
                              Splits breakdown
                            </span>

                            <div className="space-y-3 pl-0.5">
                              {expense.splits?.map((split: any, sIdx: number) => {
                                const spliterName = split.userId?.name || "Unknown";
                                const spliterAvatar = getAvatarStyle(spliterName);
                                return (
                                  <div key={sIdx} className="flex justify-between items-center border-b border-dashed border-white/[0.03] pb-2 last:border-b-0 last:pb-0">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-bold bg-gradient-to-tr border ${spliterAvatar}`}>
                                        {getInitials(spliterName)}
                                      </div>
                                      <span className="text-xs font-bold text-slate-300 truncate">
                                        {spliterName}
                                      </span>
                                    </div>
                                    <span className="font-mono text-xs font-bold text-white">
                                      ₹{split.amount?.toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Edit / Delete items action bar */}
                          {canManage && (
                            <div className="flex gap-2 justify-end pt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => handleEditClick(e, expense)}
                                className="h-8.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5"
                              >
                                <Edit2 size={11} />
                                <span>Edit</span>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteTrigger(expense._id)}
                                disabled={deleteMutation.isPending}
                                className="h-8.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5"
                              >
                                <Trash2 size={11} />
                                <span>Delete</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Confirmation modal for expense delete */}
      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense?"
        description="Are you sure you want to permanently delete this expense? This will recalculate everyone's roommate balances."
        confirmText="Delete"
        isDestructive={true}
      />

      {/* Expense Edit modal popup */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        roomId={roomId}
        expense={selectedExpense}
      />
    </div>
  );
}
