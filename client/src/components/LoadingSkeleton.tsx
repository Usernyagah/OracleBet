import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export const MarketCardSkeleton = () => (
  <Card className="p-5">
    <div className="flex items-start justify-between gap-3 mb-4">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-4 w-12" />
    </div>
    <Skeleton className="h-6 w-full mb-2" />
    <Skeleton className="h-6 w-3/4 mb-4" />
    <Skeleton className="h-2.5 w-full mb-4" />
    <div className="flex items-center justify-between pt-3 border-t border-border">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-16" />
    </div>
  </Card>
);

export const MarketGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <MarketCardSkeleton key={i} />
    ))}
  </div>
);

export const HeroSkeleton = () => (
  <div className="text-center py-20">
    <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
    <Skeleton className="h-6 w-1/2 mx-auto mb-8" />
    <Skeleton className="h-12 w-40 mx-auto" />
  </div>
);
