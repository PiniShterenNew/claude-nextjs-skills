import { Skeleton } from '@/shared/components/ui/Skeleton'

export default function RecipesLoading() {
  return (
    <div className="space-y-6">
      {/* Category filter chips + add button */}
      <div className="flex items-center gap-3 flex-wrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
        <div className="flex-1" />
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Recipe cards list */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
