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
    <div className="relative min-h-screen bg-[#04010A] text-slate-100 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Purple Glow */}
        <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />

        {/* Emerald Glow */}
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[140px]" />

        {/* Noise Overlay */}
        <div className="absolute inset-0 noise-overlay opacity-40" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="
            mx-auto
            min-h-screen
            w-full
            max-w-5xl
            px-4
            pt-6
            pb-28
            sm:px-6
            lg:px-8
          "
        >
          <Outlet />
        </motion.main>

        <BottomNavigation />
      </div>
    </div>
  );
}