import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
  `
  inline-flex
  items-center
  justify-center
  gap-2
  whitespace-nowrap
  font-semibold
  transition-all
  duration-200
  disabled:pointer-events-none
  disabled:opacity-50
  active:scale-[0.98]
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-cyan-500/40
  `,
  {
    variants: {
      variant: {
        default: `
          bg-gradient-to-r
          from-emerald-500
          to-cyan-500
          text-white
          btn-glow-green
          shimmer-btn
          hover:scale-[1.02]
          active:scale-[0.96]
          shadow-[0_0_20px_rgba(16,185,129,0.25)]
        `,

        destructive: `
          bg-gradient-to-r
          from-rose-500
          to-red-600
          text-white
          shimmer-btn
          hover:scale-[1.02]
          active:scale-[0.96]
          shadow-[0_0_20px_rgba(244,63,94,0.25)]
        `,

        outline: `
          border
          border-white/8
          bg-white/[0.02]
          text-slate-200
          backdrop-blur-md
          hover:bg-white/[0.07]
          hover:border-white/15
          hover:scale-[1.02]
          active:scale-[0.96]
        `,

        secondary: `
          border
          border-white/8
          bg-white/[0.06]
          text-white
          backdrop-blur-md
          hover:bg-white/[0.12]
          hover:scale-[1.02]
          active:scale-[0.96]
        `,

        ghost: `
          text-slate-400
          hover:bg-white/[0.04]
          hover:text-white
          active:scale-[0.96]
        `,

        link: `
          text-emerald-450
          underline-offset-4
          hover:underline
          hover:text-emerald-400
        `,
      },

      size: {
        default: "h-12 px-6 rounded-2xl",
        sm: "h-9 px-4 rounded-xl text-xs",
        lg: "h-14 px-8 rounded-2xl text-base",
        icon: "h-11 w-11 rounded-2xl",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={props.disabled || loading}
        className={cn(
          buttonVariants({
            variant,
            size,
            className,
          })
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2
              size={16}
              className="animate-spin"
            />
            <span>Processing...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
export { buttonVariants };