import React from 'react';

export function Skeleton({ className }) {
  return (
    <div className={`bg-zinc-200 dark:bg-zinc-800/60 shimmer rounded ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="w-16 h-8" />
      <Skeleton className="w-32 h-3" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="w-full overflow-hidden border border-border-light dark:border-border-dark rounded-xl bg-card-light dark:bg-card-dark">
      <div className="p-4 border-b border-border-light dark:border-border-dark flex justify-between">
        <Skeleton className="w-48 h-9 rounded-lg" />
        <Skeleton className="w-24 h-9 rounded-lg" />
      </div>
      <div className="p-4 space-y-4">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-2">
            <div className="space-y-2 flex-1 max-w-lg">
              <Skeleton className="w-1/2 h-5" />
              <Skeleton className="w-3/4 h-3" />
            </div>
            <div className="flex space-x-8">
              <Skeleton className="w-16 h-5" />
              <Skeleton className="w-24 h-5" />
              <Skeleton className="w-10 h-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-48 h-3" />
        </div>
        <Skeleton className="w-20 h-8 rounded-lg" />
      </div>
      <div className="h-64 flex items-end justify-between space-x-2 pt-4">
        <Skeleton className="w-full h-1/4 rounded-t" />
        <Skeleton className="w-full h-1/2 rounded-t" />
        <Skeleton className="w-full h-3/4 rounded-t" />
        <Skeleton className="w-full h-1/3 rounded-t" />
        <Skeleton className="w-full h-2/3 rounded-t" />
        <Skeleton className="w-full h-4/5 rounded-t" />
        <Skeleton className="w-full h-1/2 rounded-t" />
      </div>
    </div>
  );
}
