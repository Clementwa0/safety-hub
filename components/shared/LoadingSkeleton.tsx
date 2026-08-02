interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ count = 4, className = "" }: LoadingSkeletonProps) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="aspect-square animate-pulse bg-gray-200" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
