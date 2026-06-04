import { cn } from "../../utils/cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-white/5", className)}
      {...props}
    />
  );
}

export { Skeleton };
export default Skeleton;
