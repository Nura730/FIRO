import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, Search, Plus, Edit2, Trash2, Calendar, User } from "lucide-react";

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
  RENT: "bg-blue-50 text-blue-600 border border-blue-100",
  FOOD: "bg-orange-50 text-orange-600 border border-orange-100",
  UTILITIES: "bg-purple-50 text-purple-600 border border-purple-100",
  INTERNET: "bg-indigo-50 text-indigo-600 border border-indigo-100",
  TRANSPORT: "bg-cyan-50 text-cyan-600 border border-cyan-100",
  SHOPPING: "bg-pink-50 text-pink-600 border border-pink-100",
  OTHER: "bg-slate-50 text-slate-600 border border-slate-100",
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

  // Exclude settlements from standard expenses list so they don't clutter the page
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
    <div className="p-4 max-w-xl mx-auto pb-24 relative min-h-[80vh]">
      <PageHeader 
        title="Expenses" 
        subtitle={room?.roomName} 
        right={
          <button
            onClick={openAddModal}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm hover:shadow"
          >
            <Plus size={16} />
            Add Expense
          </button>
        }
      />

      {/* Search Input */}
      <div className="relative mb-3">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-green-500 transition-colors"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-4 py-1.8 rounded-full border whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-green-600 border-green-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-3">
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
              : "Expenses added to this room will appear here"
          }
        />
      ) : (
        <div className="space-y-3">
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
                  className={`p-4 cursor-pointer hover:border-slate-300 transition-all select-none ${
                    isExpanded ? "border-green-300 ring-2 ring-green-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 truncate text-base">
                          {expense.title}
                        </h3>

                        {expense.category && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
                              categoryColors[expense.category] || categoryColors.OTHER
                            }`}
                          >
                            {expense.category}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User size={12} className="text-slate-400" />
                          Paid by {expense.paidBy?.name || "Unknown"}
                        </span>
                        {dateStr && (
                          <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                            <Calendar size={12} className="text-slate-400" />
                            {dateStr}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="font-extrabold text-slate-900 ml-3 text-lg whitespace-nowrap">
                      ₹{expense.amount?.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Splits Details & Actions when expanded */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden mt-3 pt-3 border-t border-slate-100"
                        onClick={(e) => e.stopPropagation()} // prevent double toggling
                      >
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Splits Breakdown
                          </p>
                          {expense.splits?.map((split: any, sIdx: number) => (
                            <div key={sIdx} className="flex justify-between text-xs text-slate-700 font-medium">
                              <span>{split.userId?.name || "Unknown"}</span>
                              <span className="font-mono text-slate-500">₹{split.amount?.toLocaleString("en-IN")}</span>
                            </div>
                          ))}
                        </div>

                        {/* Edit/Delete Actions */}
                        {canManage && (
                          <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-slate-50">
                            <button
                              onClick={(e) => handleEditClick(e, expense)}
                              className="flex items-center gap-1 text-slate-600 hover:text-green-600 hover:bg-green-50 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-green-200 transition-all"
                            >
                              <Edit2 size={13} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(expense._id)}
                              className="flex items-center gap-1 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 transition-all"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 size={13} />
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
