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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
      <div className="max-w-xl mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1 py-2 px-3"
            >
              <Icon
                size={20}
                className={`transition-colors duration-200 ${
                  isActive ? "text-green-500" : "text-slate-400"
                }`}
              />

              <span
                className={`text-xs font-medium transition-colors duration-200 ${
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
