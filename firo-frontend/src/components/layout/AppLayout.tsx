import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col w-full">
      <main className="flex-1 pb-24 w-full max-w-xl mx-auto px-4 sm:px-6">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
