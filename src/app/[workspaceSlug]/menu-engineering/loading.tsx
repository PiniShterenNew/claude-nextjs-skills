import { Skeleton } from '@/shared/components/ui/Skeleton'

export default function MenuEngineeringLoading() {
  return (
    <div className="space-y-6">
      {/* Category filter chips */}
      <div className="flex items-center gap-3 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>

      {/* Matrix area */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <Skeleton className="w-full rounded-md" style={{ height: '500px' }} />
      </div>

      {/* Quadrant summary grid */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-4 space-y-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton variant="text" lines={2} />
          </div>
        ))}
      </div>
    </div>
  )
}
