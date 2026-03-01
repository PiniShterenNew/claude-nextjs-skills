import { Badge } from '@/shared/components/ui/Badge'

interface CostThresholdBadgeProps {
  foodCostPercent: number
  threshold: number
}

export function CostThresholdBadge({ foodCostPercent, threshold }: CostThresholdBadgeProps) {
  const variant =
    foodCostPercent > threshold ? 'destructive'
    : foodCostPercent > threshold - 5 ? 'warning'
    : 'success'

  return (
    <Badge variant={variant}>
      {foodCostPercent.toFixed(1)}%
    </Badge>
  )
}
