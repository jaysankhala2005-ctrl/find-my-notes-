import React from 'react'
import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
  rounded?: boolean
  circle?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  circle,
}) => {
  return (
    <div
      className={clsx('skeleton', circle && 'rounded-full', className)}
      style={{ width, height }}
    />
  )
}

export const CardSkeleton: React.FC = () => (
  <div className="card p-5 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10" circle />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-5/6" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-7 w-20 rounded-full" />
      <Skeleton className="h-7 w-16 rounded-full" />
    </div>
  </div>
)

export const SubjectCardSkeleton: React.FC = () => (
  <div className="card p-6 space-y-4">
    <Skeleton className="h-12 w-12 rounded-xl" />
    <Skeleton className="h-5 w-4/5" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-4 w-20" />
    </div>
  </div>
)
