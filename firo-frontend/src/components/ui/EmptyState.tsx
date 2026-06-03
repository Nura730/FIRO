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
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-[20px] bg-[#22C55E]/10 flex items-center justify-center mb-5 text-[#22C55E]">
        <Icon size={28} />
      </div>

      <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">{title}</h3>

      {description && (
        <p className="text-sm font-medium text-[#64748B] mt-1.5 max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-6 w-full max-w-xs">{action}</div>}
    </div>
  );
}
