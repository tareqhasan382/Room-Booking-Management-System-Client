export const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`}
  />
);

export const RoomCardSkeleton = () => (
  <div className="w-full h-[400px] bg-slate-100 dark:bg-slate-700 rounded overflow-hidden">
    <Skeleton className="w-full h-[60%] rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  </div>
);

export const RoomGridSkeleton = ({ count = 6 }) => (
  <div className="w-full grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 py-5">
    {Array.from({ length: count }).map((_, i) => (
      <RoomCardSkeleton key={i} />
    ))}
  </div>
);

export const PageSkeleton = () => (
  <div className="w-full flex flex-col items-center justify-center py-20">
    <Skeleton className="h-8 w-56 mb-8" />
    <div className="w-full lg:w-3/4 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
      <Skeleton className="w-full h-72 rounded-none" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-10 w-40 mt-4" />
      </div>
    </div>
  </div>
);
