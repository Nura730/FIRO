import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  DoorOpen,
} from "lucide-react";

import { useRoom } from "../../providers/RoomProvider";
import { useToast } from "../../providers/ToastProvider";

const navItems = [
  {
    label: "Home",
    path: "/dashboard",
    icon: LayoutDashboard,
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
    icon: DoorOpen,
    requiresRoom: false,
  },
];

export default function BottomNavigation() {
  const location = useLocation();
  const { room } = useRoom();
  const { showToast } = useToast();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: (typeof navItems)[number]
  ) => {
    if (item.requiresRoom && !room) {
      e.preventDefault();
      showToast("Please select or create a room first!");
    }
  };

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-24px)] max-w-md -translate-x-1/2">
      <div className="flex items-center justify-around rounded-[28px] border border-white/10 bg-[#0B1020]/90 px-2 py-3 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
        {navItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");

          const isDisabled =
            item.requiresRoom && !room;

          return (
            <Link
              key={item.path}
              to={isDisabled ? "#" : item.path}
              onClick={(e) => handleNavClick(e, item)}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 transition-all ${
                isDisabled
                  ? "cursor-not-allowed opacity-40"
                  : "opacity-100"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-2xl bg-[#22C55E]/10" />
              )}

              <Icon
                size={20}
                className={`relative z-10 transition-colors ${
                  isActive
                    ? "text-[#22C55E]"
                    : "text-zinc-500"
                }`}
              />

              <span
                className={`relative z-10 text-[10px] font-bold tracking-wide ${
                  isActive
                    ? "text-[#22C55E]"
                    : "text-zinc-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}