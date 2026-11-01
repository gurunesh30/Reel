/**
 * Zero-CLS Skeleton Loaders
 * Implements Micro-UX Pattern #1 (Pulse-animated skeleton cards matching exact dimensions)
 */

import React, { type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-[#1F232B]/80 rounded-xl border border-white/5',
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton matching MovieCard dimensions
 */
export function MovieCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl bg-[#16191E] border border-white/5 overflow-hidden p-3 shadow-lg',
        className
      )}
    >
      <Skeleton className="w-full aspect-[2/3] rounded-xl mb-3" />
      <div className="space-y-2 p-1">
        <Skeleton className="h-5 w-3/4 rounded-md" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton matching ShowtimePill dimensions
 */
export function ShowtimePillSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-14 w-28 rounded-xl bg-[#16191E] border border-white/5 p-2 flex flex-col justify-center items-center gap-1.5 animate-pulse',
        className
      )}
    >
      <Skeleton className="h-4 w-14 rounded-md" />
      <Skeleton className="h-3 w-10 rounded-full" />
    </div>
  );
}

/**
 * Skeleton matching SeatGrid and Curved Screen topology
 */
export function SeatGridSkeleton({ className }: { className?: string }) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  return (
    <div
      className={cn(
        'w-full max-w-3xl mx-auto flex flex-col items-center gap-6 py-6 animate-pulse',
        className
      )}
    >
      {/* Screen Bar Skeleton */}
      <div className="w-4/5 h-2.5 rounded-full bg-gradient-to-r from-transparent via-[#26523C]/50 to-transparent mb-6" />

      {/* Grid Rows */}
      <div className="flex flex-col gap-3 w-full items-center">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-2 md:gap-3">
            <Skeleton className="w-5 h-5 rounded-md" />
            <div className="flex gap-1.5 md:gap-2">
              {Array.from({ length: 10 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className={cn(
                    'w-7 h-7 sm:w-8 sm:h-8 rounded-lg',
                    idx === 1 || idx === 7 ? 'mr-3' : ''
                  )}
                />
              ))}
            </div>
            <Skeleton className="w-5 h-5 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton matching OrderSummary Card
 */
export function OrderSummarySkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-full max-w-lg mx-auto rounded-2xl bg-[#16191E] border border-white/10 p-6 space-y-4',
        className
      )}
    >
      <Skeleton className="h-6 w-1/2 rounded-md" />
      <Skeleton className="h-4 w-3/4 rounded-md" />
      <div className="border-t border-white/5 my-4" />
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded-xl mt-6" />
    </div>
  );
}
