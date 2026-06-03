import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, Search, Plus, Edit2, Trash2, Calendar, User, ChevronDown, ChevronUp } from "lucide-react";

import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import PageHeader from "../../../components/layout/PageHeader";
import ExpenseModal from "../components/ExpenseModal";

import { useRoom } from "../../../providers/RoomProvider";
import { useExpenses } from "../hooks/useExpenses";
import { useDeleteExpense } from "../hooks/useDeleteExpense";
import { useAuth } from "../../../providers/AuthProvider";

const CATEGORIES = ["ALL", "RENT", "FOOD", "UTILITIES", "INTERNET", "TRANSPORT", "SHOPPING", "OTHER"];

const categoryColors: Record<string, string> = {
  RENT: "bg-blue-50 text-blue-600 border border-blue-100/60",
  FOOD: "bg-orange-50 text-orange-600 border border-orange-100/60",
  UTILITIES: "bg-purple-50 text-purple-600 border border-purple-100/60",
  INTERNET: "bg-indigo-50 text-indigo-600 border border-indigo-100/60",
  TRANSPORT: "bg-cyan-50 text-cyan-600 border border-cyan-100/60",
  SHOPPING: "bg-pink-50 text-pink-600 border border-pink-100/60",
  OTHER: "bg-slate-50 text-slate-600 border border-slate-100/60",
};

export default function ExpensesPage() {
  const { user: currentUser } = useAuth();
  const { room } = useRoom();
  const roomId = room?.roomId || "";
  const { data, isLoading } = useExpenses(roomId);
  const deleteMutation = useDeleteExpense();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  
  // Track which card is expanded for editing/deleting
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
    if (window.confirm("Are you sure you want to delete this expense?")) {
      deleteMutation.mutate(expenseId);
    }
  };

  const handleEditClick = (e: React.MouseEvent, expense: any) => {
    e.stopPropagation();
    setSelectedExpense(expense);
    setModalOpen(true);
  };

  const handleCardClick = (expenseId: string) => {
    setExpandedExpenseId((prev) => (prev === expenseId ? null : expenseId));
  };

  const openAddModal = () => {
    setSelectedExpense(null);
    setModalOpen(true);
  };

  return (
    <div className="py-6 space-y-5 pb-24 relative min-h-[80vh]">
      <PageHeader 
        title="Expenses" 
        subtitle={room?.roomName} 
      />

      {/* Search Input */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#22C55E] transition-colors shadow-sm"
        />
      </div>

      {/* Category Pills (horizontal scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-bold px-4 py-2 rounded-full border whitespace-nowrap transition-all active:scale-95 ${
                isSelected
                  ? "bg-[#22C55E] border-[#22C55E] text-white shadow-sm"
                  : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-slate-300"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={search || selectedCategory !== "ALL" ? "No results found" : "No expenses yet"}
          description={
            search || selectedCategory !== "ALL"
              ? "Try adjusting your search or filters"
              : "Keep track of bills with your roommates here"
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((expense: any, index: number) => {
            const isExpanded = expandedExpenseId === expense._id;
            const creatorId = expense.createdBy?._id || expense.createdBy;
            const canManage = currentUser?.id === creatorId;
            const dateStr = expense.createdAt
              ? new Date(expense.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "";

            return (
              <motion.div
                key={expense._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
                layout="position"
              >
                <Card 
                  onClick={() => handleCardClick(expense._id)}
                  className={`p-5 cursor-pointer bg-white border-[#E2E8F0]/80 shadow-[0_8px_30px_rgba(15,23,42,0.01)] transition-all rounded-[24px] ${
                    isExpanded ? "border-[#22C55E] ring-2 ring-[#22C55E]/5" : "hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <h3 className="font-bold text-slate-800 truncate text-base">
                          {expense.title}
                        </h3>

                        {expense.category && (
                          <span
                            className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
                              categoryColors[expense.category] || categoryColors.OTHER
                            }`}
                          >
                            {expense.category}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B] font-medium">
                        <span className="flex items-center gap-1">
                          <User size={12} className="text-slate-400" />
                          Paid by {expense.paidBy?.name || "Unknown"}
                        </span>
                        {dateStr && (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                            <Calendar size={12} className="text-slate-400" />
                            {dateStr}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
                      <p className="font-black text-[#0F172A] text-lg font-mono">
                        ₹{expense.amount?.toLocaleString("en-IN")}
                      </p>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center">
                        {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        Details
                      </span>
                    </div>
                  </div>

                  {/* Splits Details & Actions when expanded */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-slate-100"
                        onClick={(e) => e.stopPropagation()} // prevent double toggling
                      >
                        <div className="space-y-2">
                          <p className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider mb-2">
                            Splits Breakdown
                          </p>
                          {expense.splits?.map((split: any, sIdx: number) => (
                            <div key={sIdx} className="flex justify-between text-xs text-slate-700 font-medium">
                              <span>{split.userId?.name || "Unknown"}</span>
                              <span className="font-mono text-slate-500 font-bold">₹{split.amount?.toLocaleString("en-IN")}</span>
                            </div>
                          ))}
                        </div>

                        {/* Edit/Delete Actions */}
                        {canManage && (
                          <div className="flex gap-2 justify-end mt-5 pt-3 border-t border-slate-50">
                            <button
                              onClick={(e) => handleEditClick(e, expense)}
                              className="flex items-center gap-1.5 text-slate-600 hover:text-[#22C55E] hover:bg-green-50 text-xs font-bold px-3 py-2 rounded-xl border border-[#E2E8F0] hover:border-[#22C55E]/30 transition-all"
                            >
                              <Edit2 size={12} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(expense._id)}
                              className="flex items-center gap-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs font-bold px-3 py-2 rounded-xl border border-[#E2E8F0] hover:border-red-200 transition-all"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-24 right-6 sm:right-[calc(50%-17rem)] z-40">
        <button
          onClick={openAddModal}
          title="Add new expense"
          className="w-14 h-14 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(34,197,94,0.3)] hover:shadow-[0_8px_30px_rgba(34,197,94,0.4)] active:scale-95 transition-all text-lg font-bold"
        >
          <Plus size={24} />
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
