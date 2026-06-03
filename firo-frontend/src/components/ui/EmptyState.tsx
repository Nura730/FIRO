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
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-zinc-200 bg-white rounded-xl shadow-sm">
      <div className="w-12 h-12 rounded-lg bg-zinc-50 border border-zinc-150 flex items-center justify-center mb-4 text-zinc-900 shadow-sm">
        <Icon size={20} className="stroke-[1.75]" />
      </div>

      <h3 className="text-sm font-bold text-zinc-900 tracking-tight">{title}</h3>

      {description && (
        <p className="text-xs font-semibold text-zinc-500 mt-1.5 max-w-[240px] mx-auto leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-5 w-full max-w-[200px]">{action}</div>}
    </div>
  );
}
