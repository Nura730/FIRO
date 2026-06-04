import type { ElementType } from "react";

interface EmptyStateProps {
  icon: ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-dashed border-white/10 bg-white/[0.02] rounded-3xl backdrop-blur-xl">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <Icon size={24} className="stroke-[1.75]" />
      </div>

      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>

      {description && (
        <p className="text-xs font-medium text-zinc-400 mt-2 max-w-[260px] mx-auto leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-5 w-full max-w-[200px]">{action}</div>}
    </div>
  );
}
