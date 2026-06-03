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
    label: "Dashboard",
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
    label: "Settlements",
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

  const handleNavClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    if (item.requiresRoom && !room) {
      e.preventDefault();
      showToast("Please select or create a room first!", "info");
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40 rounded-t-[24px] shadow-[0_-8px_24px_rgba(15,23,42,0.04)] pb-safe">
      <div className="flex justify-around items-center h-16 px-6 w-full">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          const isDisabled = item.requiresRoom && !room;

          return (
            <Link
              key={item.path}
              to={isDisabled ? "#" : item.path}
              onClick={(e) => handleNavClick(e, item)}
              className={`flex flex-col items-center justify-center gap-1.5 py-1 px-3 flex-1 transition-all active:scale-95 ${
                isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <Icon
                size={20}
                className={`transition-colors duration-200 ${
                  isActive ? "text-[#22C55E]" : "text-[#64748B]"
                }`}
              />

              <span
                className={`text-[10px] font-bold tracking-wide transition-colors duration-200 ${
                  isActive ? "text-[#22C55E]" : "text-[#64748B]"
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
