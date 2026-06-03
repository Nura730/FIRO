import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, Search, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Home, Utensils, Zap, Wifi, Car, ShoppingBag, DollarSign } from "lucide-react";

import Button from "../../../components/ui/Button";
import Card, { CardContent } from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import EmptyState from "../../../components/ui/EmptyState";
import { Skeleton } from "../../../components/ui/Skeleton";
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

const categoryIconStyles: Record<string, string> = {
  RENT: "bg-blue-50 text-blue-500 border border-blue-100",
  FOOD: "bg-orange-50 text-orange-500 border border-orange-100",
  UTILITIES: "bg-purple-50 text-purple-500 border border-purple-100",
  INTERNET: "bg-indigo-50 text-indigo-500 border border-indigo-100",
  TRANSPORT: "bg-cyan-50 text-cyan-500 border border-cyan-100",
  SHOPPING: "bg-pink-50 text-pink-500 border border-pink-100",
  OTHER: "bg-slate-50 text-slate-500 border border-slate-100",
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

  const handleDelete = (expenseId: string) => {
    if (window.confirm("Permanently delete this expense?")) {
      deleteMutation.mutate(expenseId, {
        onSuccess: () => showToast("Expense deleted successfully", "success"),
        onError: () => showToast("Failed to delete expense", "error"),
      });
    }
  };

  const handleEditClick = (e: React.MouseEvent, expense: any) => {
    e.stopPropagation();
    setSelectedExpense(expense);
    setModalOpen(true);
  };

  const handleRowClick = (expenseId: string) => {
    setExpandedExpenseId((prev) => (prev === expenseId ? null : expenseId));
  };

  const openAddModal = () => {
    setSelectedExpense(null);
    setModalOpen(true);
  };

  return (
    <div className="w-full py-4 space-y-6">
      {/* 1. Header & Search Toggle */}
      <div className="flex justify-between items-center pl-0.5">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#22C55E] uppercase pl-0.5">
            {room?.roomName}
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mt-1">
            Expenses
          </h1>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setSearchOpen(!searchOpen)}
          className={`h-11 w-11 rounded-full border-white/10 bg-white/5 text-white ${
  searchOpen
    ? "border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]"
    : ""
}`}
        >
          <Search size={18} />
        </Button>
      </div>

      {/* 2. Collapsible Search Input */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <Input
              placeholder="Search by description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Category scrollable filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar -mx-4 px-4 scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-bold px-4.5 py-2 rounded-full border whitespace-nowrap transition-all active:scale-95 ${
                isSelected
                  ? "bg-[#22C55E] border-[#22C55E] text-white shadow-sm"
                  : "bg-white/5 border-white/10 text-zinc-500 hover:border-zinc-300"
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
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={search || selectedCategory !== "ALL" ? "No matches found" : "No expenses recorded"}
          description={
            search || selectedCategory !== "ALL"
              ? "Try adjusting your search filter or category."
              : "Track shared roommate bills and expenses here."
          }
        />
      ) : (
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-0 divide-y divide-white/5">
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
              const iconStyle = categoryIconStyles[expense.category] || categoryIconStyles.OTHER;

              return (
                <div
                  key={expense._id}
                  onClick={() => handleRowClick(expense._id)}
                  className="p-5 cursor-pointer hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconStyle}`}>
                        <IconComponent size={18} />
                      </div>

                      {/* Details */}
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-bold text-white text-sm truncate">
                          {expense.title}
                        </h4>
                        <p className="text-xs text-zinc-500 font-semibold">
                          Paid by {expense.paidBy?.name || "Unknown"} • {dateStr}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <p className="font-bold text-white font-mono text-base">
                        ₹{expense.amount?.toLocaleString("en-IN")}
                      </p>
                      <span className="text-zinc-300">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Splits and Settings */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-white/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-3.5">
                          <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">
                            splits breakdown
                          </span>

                          <div className="space-y-2.5 pl-0.5">
                            {expense.splits?.map((split: any, sIdx: number) => (
                              <div key={sIdx} className="flex justify-between text-xs text-zinc-650 font-bold">
                                <span>{split.userId?.name || "Unknown"}</span>
                                <span className="font-mono text-white">₹{split.amount?.toLocaleString("en-IN")}</span>
                              </div>
                            ))}
                          </div>

                          {/* Edit/Delete Triggers */}
                          {canManage && (
                            <div className="flex gap-2.5 justify-end pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => handleEditClick(e, expense)}
                                className="font-bold h-9 flex items-center gap-1"
                              >
                                <Edit2 size={11} />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(expense._id)}
                                disabled={deleteMutation.isPending}
                                className="font-bold h-9 flex items-center gap-1"
                              >
                                <Trash2 size={11} />
                                Delete
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

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-24 right-5 z-40">
        <button
  onClick={openAddModal}
  title="Add expense"
  className="w-16 h-16 rounded-full bg-[#22C55E] text-white flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.45)] hover:scale-105 active:scale-95 transition-all"
>
  <Plus size={26} />
</button>
      </div>

      {/* Expense Form Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        roomId={roomId}
        expense={selectedExpense}
      />
    </div>
  );
}
