import * as React from "react";
import { cn } from "../../utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, startIcon, endIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            {label}
          </label>
        )}
        <div
          className={cn(
            "relative flex items-center h-13 w-full rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-md transition-all duration-300 focus-within:border-emerald-500/40 focus-within:ring-2 focus-within:ring-emerald-500/10 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_20px_rgba(16,185,129,0.08)]",
            className
          )}
        >
          {startIcon && (
            <div className="absolute left-4 text-slate-450 pointer-events-none select-none flex items-center justify-center">
              {startIcon}
            </div>
          )}

          <input
            type={type}
            className={cn(
              "w-full h-full bg-transparent py-2.5 text-sm font-semibold text-white placeholder:text-zinc-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              startIcon ? "pl-11" : "pl-4.5",
              endIcon ? "pr-11" : "pr-4.5"
            )}
            ref={ref}
            {...props}
          />

          {endIcon && (
            <div className="absolute right-4 text-slate-450 flex items-center justify-center">
              {endIcon}
            </div>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;
export { Input };