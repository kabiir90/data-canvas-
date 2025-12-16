interface SkeletonProps {
  width?: string
  height?: string
  className?: string
}

export default function Skeleton({ width, height, className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-loading rounded-lg ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

