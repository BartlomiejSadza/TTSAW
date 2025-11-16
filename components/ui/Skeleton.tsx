import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200';

  const variants = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      style={{ width, height }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <Skeleton height={24} className="mb-4 w-1/3" />
      <Skeleton height={16} className="mb-2 w-full" />
      <Skeleton height={16} className="mb-2 w-2/3" />
      <Skeleton height={16} className="w-1/2" />
    </div>
  );
}

export function RoomCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton height={24} className="w-20" />
        <Skeleton height={24} className="w-24 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton height={16} className="w-32" />
        <Skeleton height={16} className="w-40" />
        <Skeleton height={16} className="w-48" />
      </div>
      <Skeleton height={36} className="w-full mt-4" />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
          <Skeleton height={36} className="w-16 mx-auto mb-2" />
          <Skeleton height={16} className="w-32 mx-auto" />
        </div>
      ))}
    </div>
  );
}
