import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export default function Card({
  children,
  className = "",
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white
        border
        border-slate-200
        rounded-2xl
        shadow-sm
        ${className}
      `}
    >
      {children}
    </div>
  );
}