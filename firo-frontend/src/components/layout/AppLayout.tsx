import { Outlet, Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import BottomNavigation from "../navigation/BottomNavigation";
import { useRoom } from "../../providers/RoomProvider";

export default function AppLayout() {
  const { room } = useRoom();
  const location = useLocation();

  if (!room && location.pathname !== "/rooms") {
    return <Navigate to="/rooms" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-[-100px] h-[400px] w-[400px] rounded-full bg-[#22C55E]/10 blur-[140px]" />

        <div className="absolute bottom-[-150px] right-[-100px] h-[300px] w-[300px] rounded-full bg-emerald-400/10 blur-[140px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 flex-1 pb-28 px-4 pt-4"
      >
        <Outlet />
      </motion.main>

      <BottomNavigation />
    </div>
  );
}