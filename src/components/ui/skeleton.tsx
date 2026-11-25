import type { HTMLAttributes } from "react"

type SkeletonProps = HTMLAttributes<HTMLDivElement>

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-(--esqueleto-base) motion-reduce:animate-none ${className}`}
      {...props}
    />
  )
}
