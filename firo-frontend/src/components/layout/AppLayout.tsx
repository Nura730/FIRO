import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50">
      <main className="flex-grow overflow-y-auto pb-20 no-scrollbar">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
