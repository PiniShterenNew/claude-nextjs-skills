import { cn } from '@/shared/lib/cn'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'rect'
  lines?: number
}

export function Skeleton({ variant = 'rect', lines = 1, className, ...props }: SkeletonProps) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 animate-pulse rounded bg-surface-subtle',
              i === lines - 1 && 'w-3/4',
              className
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-surface-subtle',
        variant === 'circle' ? 'rounded-full' : 'rounded-md',
        variant === 'text' ? 'h-4 w-full' : '',
        className
      )}
      {...props}
    />
  )
}
