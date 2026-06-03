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
    <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40 rounded-t-[20px] shadow-[0_-4px_12px_rgba(15,23,42,0.03)] pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1.5 py-1.5 px-3 flex-1 transition-all active:scale-95"
            >
              <Icon
                size={20}
                className={`transition-colors duration-200 ${
                  isActive ? "text-green-500" : "text-slate-400"
                }`}
              />

              <span
                className={`text-[11px] font-semibold tracking-wide transition-colors duration-200 ${
                  isActive ? "text-green-500" : "text-slate-400"
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
