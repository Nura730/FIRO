import { Outlet } from "react-router-dom";
import BottomNav from "../components/layout/BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="pb-24">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}