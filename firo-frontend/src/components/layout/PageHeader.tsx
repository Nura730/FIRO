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
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-2 text-sm text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      {right && (
        <div className="shrink-0">
          {right}
        </div>
      )}
    </div>
  );
}