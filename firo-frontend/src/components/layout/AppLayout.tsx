import { Outlet, Navigate, useLocation } from "react-router-dom";
import BottomNavigation from "../navigation/BottomNavigation";
import { useRoom } from "../../providers/RoomProvider";

export default function AppLayout() {
  const { room } = useRoom();
  const location = useLocation();

  // If logged in but no room is active, redirect to /rooms (unless already on /rooms)
  if (!room && location.pathname !== "/rooms") {
    return <Navigate to="/rooms" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col w-full">
      <main className="flex-1 pb-28 w-full px-4 pt-4">
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  );
}
