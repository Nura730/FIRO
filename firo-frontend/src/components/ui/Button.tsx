import type { ButtonHTMLAttributes } from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export default function Button({
  children,
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        w-full
        rounded-xl
        bg-green-500
        text-white
        font-semibold
        py-3
        transition-all
        duration-200
        hover:opacity-90
        active:scale-[0.98]
        disabled:opacity-60
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}