import { Skeleton } from '@/components/ui/skeleton';

export function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-8 lg:py-12">
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-3 sm:space-y-4">
          <Skeleton className="aspect-square rounded-2xl sm:rounded-3xl" />
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg sm:rounded-xl" />
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 sm:h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <Skeleton className="h-20 sm:h-24 w-full" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Skeleton className="h-12 sm:h-14" />
            <Skeleton className="h-12 sm:h-14" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}