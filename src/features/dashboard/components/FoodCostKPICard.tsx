import { Card } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'

interface FoodCostKPICardProps {
  label: string
  value: string
  unit?: string
  highlight?: 'good' | 'warning' | 'bad'
  subtext?: string
}

const highlightColors = {
  good: 'text-success',
  warning: 'text-warning',
  bad: 'text-destructive',
}

export function FoodCostKPICard({ label, value, unit, highlight, subtext }: FoodCostKPICardProps) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-end gap-1">
        <span
          className={`text-3xl font-bold ${
            highlight ? highlightColors[highlight] : 'text-foreground-secondary'
          }`}
        >
          {value}
        </span>
        {unit && <span className="text-sm text-muted-foreground mb-1">{unit}</span>}
      </div>
      {subtext && <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>}
      {highlight && (
        <Badge
          variant={highlight === 'good' ? 'success' : highlight === 'warning' ? 'warning' : 'destructive'}
          className="mt-2"
        >
          {highlight === 'good' ? 'תקין' : highlight === 'warning' ? 'גבוה' : 'קריטי'}
        </Badge>
      )}
    </Card>
  )
}
