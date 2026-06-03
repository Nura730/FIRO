import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="pb-20">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
