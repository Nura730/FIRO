import AppRoutes from "./routes";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center sm:py-6">
      {/* Premium Smartphone Viewport Frame */}
      <div className="w-full max-w-md h-screen sm:h-[88vh] sm:rounded-[32px] sm:shadow-[0_24px_64px_-16px_rgba(15,23,42,0.12)] sm:border sm:border-slate-200 bg-slate-50 flex flex-col relative overflow-hidden">
        {/* Inner layout viewport */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <AppRoutes />
        </div>
      </div>
    </div>
  );
}