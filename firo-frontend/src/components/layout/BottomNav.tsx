import { NavLink } from "react-router-dom";

import {
  House,
  Users,
  PlusCircle,
  ClockCounterClockwise,
  User,
} from "phosphor-react";

export default function BottomNav() {
  const navClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `flex flex-col items-center gap-1 ${
      isActive
        ? "text-lime-400"
        : "text-zinc-500"
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950 px-4 py-3">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <NavLink
          to="/home"
          className={navClass}
        >
          <House size={22} />
          <span className="text-xs">
            Home
          </span>
        </NavLink>

        <NavLink
          to="/rooms"
          className={navClass}
        >
          <Users size={22} />
          <span className="text-xs">
            Rooms
          </span>
        </NavLink>

        <NavLink
          to="/rooms"
          className={navClass}
        >
          <PlusCircle size={28} />
          <span className="text-xs">
            Add
          </span>
        </NavLink>

        <NavLink
          to="/activity"
          className={navClass}
        >
          <ClockCounterClockwise
            size={22}
          />
          <span className="text-xs">
            Activity
          </span>
        </NavLink>

        <NavLink
          to="/profile"
          className={navClass}
        >
          <User size={22} />
          <span className="text-xs">
            Profile
          </span>
        </NavLink>
      </div>
    </div>
  );
}