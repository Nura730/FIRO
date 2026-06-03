interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-slate-200 rounded-lg animate-pulse ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>

        <Skeleton className="h-6 w-16 ml-4" />
      </div>
    </div>
  );
}
