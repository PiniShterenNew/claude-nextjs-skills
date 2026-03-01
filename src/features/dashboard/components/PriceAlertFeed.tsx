import type { AlertRow } from '../types'

interface PriceAlertFeedProps {
  alerts: AlertRow[]
}

export function PriceAlertFeed({ alerts }: PriceAlertFeedProps) {
  if (alerts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">אין עדכוני מחיר אחרונים</p>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {alerts.map((alert, i) => (
        <li key={i} className="flex items-start gap-3 py-3">
          <span className="material-symbols-outlined text-warning text-base mt-0.5 shrink-0">
            price_change
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {alert.ingredientName}
            </p>
            <p className="text-xs text-muted-foreground">
              {alert.affectedRecipeCount > 0
                ? `משפיע על ${alert.affectedRecipeCount} מתכונים · `
                : ''}
              {alert.actorName} · {new Date(alert.changedAt).toLocaleDateString('he-IL')}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
