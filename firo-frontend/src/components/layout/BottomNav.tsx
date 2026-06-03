import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  DoorOpen,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Expenses",
    path: "/expenses",
    icon: Receipt,
  },
  {
    label: "Settlements",
    path: "/settlements",
    icon: ArrowLeftRight,
  },
  {
    label: "Rooms",
    path: "/rooms",
    icon: DoorOpen,
  },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40 rounded-t-[24px] shadow-[0_-8px_24px_rgba(15,23,42,0.04)] pb-safe">
      <div className="max-w-xl mx-auto flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1.5 py-1 px-3 flex-1 transition-all active:scale-95"
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
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
