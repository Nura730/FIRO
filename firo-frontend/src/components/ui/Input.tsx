import type { InputHTMLAttributes } from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({
  label,
  className = "",
  ...props
}: InputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>

      <input
        {...props}
        className={`
          w-full
          rounded-xl
          border
          border-slate-300
          px-4
          py-3
          outline-none
          transition-colors
          focus:border-green-500
          ${className}
        `}
      />
    </div>
  );
}