import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  House,
  Receipt,
  Plus,
  ArrowLeftRight,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

import { useRoom } from "../../providers/RoomProvider";
import { useToast } from "../../providers/ToastProvider";
import ExpenseModal from "../../features/expenses/components/ExpenseModal";

const navItems = [
  {
    label: "Home",
    path: "/dashboard",
    icon: House,
    requiresRoom: true,
  },
  {
    label: "Expenses",
    path: "/expenses",
    icon: Receipt,
    requiresRoom: true,
  },
  {
    label: "Settle",
    path: "/settlements",
    icon: ArrowLeftRight,
    requiresRoom: true,
  },
  {
    label: "Rooms",
    path: "/rooms",
    icon: Users,
    requiresRoom: false,
  },
];

export default function BottomNavigation() {
  const location = useLocation();
  const { room } = useRoom();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: (typeof navItems)[number]
  ) => {
    if (item.requiresRoom && !room) {
      e.preventDefault();
      showToast("Please select a room first", "info");
    }
  };

  const handleCreateExpenseClick = () => {
    if (!room) {
      showToast("Please select a room first", "info");
      return;
    }

    setModalOpen(true);
  };

  return (
    <>
      <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-24px)] max-w-lg -translate-x-1/2 pb-safe">
        <div className="relative flex items-center justify-between rounded-3xl border border-white/10 bg-black/70 px-2 py-2 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.45)]">

          {/* Left Side */}
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;

            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className="flex flex-1 justify-center"
              >
                <motion.div
                  whileTap={{ scale: 0.96 }}
                  className={`flex min-w-[78px] flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-all duration-300 ${
                    isActive
                      ? "bg-emerald-500/15 border border-emerald-500/20"
                      : "border border-transparent"
                  }`}
                >
                  <Icon
                    size={20}
                    className={
                      isActive
                        ? "text-emerald-400"
                        : "text-slate-400"
                    }
                  />

                  <span
                    className={`text-[11px] font-semibold ${
                      isActive
                        ? "text-white"
                        : "text-slate-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}

          {/* Center FAB */}
          <div className="px-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleCreateExpenseClick}
              aria-label="Add Expense"
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-emerald-500
                to-violet-500
                text-white
                shadow-[0_10px_30px_rgba(16,185,129,0.35)]
              "
            >
              <Plus size={24} />
            </motion.button>
          </div>

          {/* Right Side */}
          {navItems.slice(2).map((item) => {
            const Icon = item.icon;

            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className="flex flex-1 justify-center"
              >
                <motion.div
                  whileTap={{ scale: 0.96 }}
                  className={`flex min-w-[78px] flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-all duration-300 ${
                    isActive
                      ? "bg-emerald-500/15 border border-emerald-500/20"
                      : "border border-transparent"
                  }`}
                >
                  <Icon
                    size={20}
                    className={
                      isActive
                        ? "text-emerald-400"
                        : "text-slate-400"
                    }
                  />

                  <span
                    className={`text-[11px] font-semibold ${
                      isActive
                        ? "text-white"
                        : "text-slate-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {room && (
        <ExpenseModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          roomId={room.roomId}
        />
      )}
    </>
  );
}