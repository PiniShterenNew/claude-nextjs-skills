import { Badge } from '@/shared/components/ui/Badge'

interface CostThresholdBadgeProps {
  foodCostPercent: number
  threshold: number
}

const STATUS_LABEL = {
  destructive: 'חריג',
  warning: 'אזהרה',
  success: 'תקין',
} as const

export function CostThresholdBadge({ foodCostPercent, threshold }: CostThresholdBadgeProps) {
  const variant: 'destructive' | 'warning' | 'success' =
    foodCostPercent > threshold ? 'destructive'
    : foodCostPercent > threshold - 5 ? 'warning'
    : 'success'

  const label = STATUS_LABEL[variant]

  return (
    <Badge
      variant={variant}
      aria-label={`Food cost ${foodCostPercent.toFixed(1)}% — ${label}`}
    >
      {foodCostPercent.toFixed(1)}%{' '}
      <span className="text-[0.65rem] opacity-80 ms-0.5">{label}</span>
    </Badge>
  )
}
