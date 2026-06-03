import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  right,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">{title}</h1>

        {subtitle && (
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mt-1">{subtitle}</p>
        )}
      </div>

      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
