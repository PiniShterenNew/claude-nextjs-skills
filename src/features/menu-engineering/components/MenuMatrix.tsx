'use client'

import { useState } from 'react'
import type { DishMatrixPoint } from '../types'

const SVG_W = 600
const SVG_H = 500
const PAD = 60

interface MenuMatrixProps {
  dishes: DishMatrixPoint[]
  avgProfitability: number
  avgPopularity: number
  onSelectDish?: (dish: DishMatrixPoint | null) => void
}

const QUADRANT_COLORS: Record<string, string> = {
  STAR: '#22c55e',
  WORKHORSE: '#3b82f6',
  PUZZLE: '#f59e0b',
  DOG: '#ef4444',
}

export function MenuMatrix({ dishes, avgProfitability, avgPopularity, onSelectDish }: MenuMatrixProps) {
  const [tooltip, setTooltip] = useState<{ dish: DishMatrixPoint; x: number; y: number } | null>(null)

  if (dishes.length < 2) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        נדרשים לפחות 2 מתכונים עם מחיר מכירה כדי להציג את המטריצה
      </div>
    )
  }

  const maxPop = Math.max(...dishes.map((d) => d.popularity), avgPopularity * 2, 1)
  const maxProfit = Math.max(...dishes.map((d) => d.profitability), 100)
  const maxRadius = Math.max(...dishes.map((d) => d.popularity), 1)

  function toSvgX(pop: number) {
    return PAD + ((pop / maxPop) * (SVG_W - PAD * 2))
  }
  function toSvgY(profit: number) {
    return SVG_H - PAD - ((profit / maxProfit) * (SVG_H - PAD * 2))
  }

  const divX = toSvgX(avgPopularity)
  const divY = toSvgY(avgProfitability)

  return (
    <div className="relative overflow-hidden">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-auto"
        aria-label="מטריצת Menu Engineering"
      >
        {/* Quadrant backgrounds */}
        <rect x={PAD} y={PAD} width={divX - PAD} height={divY - PAD} fill="#f59e0b" fillOpacity={0.05} />
        <rect x={divX} y={PAD} width={SVG_W - PAD - divX} height={divY - PAD} fill="#22c55e" fillOpacity={0.05} />
        <rect x={PAD} y={divY} width={divX - PAD} height={SVG_H - PAD - divY} fill="#ef4444" fillOpacity={0.05} />
        <rect x={divX} y={divY} width={SVG_W - PAD - divX} height={SVG_H - PAD - divY} fill="#3b82f6" fillOpacity={0.05} />

        {/* Divider lines */}
        <line x1={divX} y1={PAD} x2={divX} y2={SVG_H - PAD} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="6 4" />
        <line x1={PAD} y1={divY} x2={SVG_W - PAD} y2={divY} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="6 4" />

        {/* Quadrant labels */}
        <text x={PAD + 6} y={PAD + 16} fontSize={11} fill="#f59e0b" opacity={0.8}>חידה</text>
        <text x={divX + 6} y={PAD + 16} fontSize={11} fill="#22c55e" opacity={0.8}>כוכב</text>
        <text x={PAD + 6} y={SVG_H - PAD - 6} fontSize={11} fill="#ef4444" opacity={0.8}>כלב</text>
        <text x={divX + 6} y={SVG_H - PAD - 6} fontSize={11} fill="#3b82f6" opacity={0.8}>עובד חרוץ</text>

        {/* Axis labels */}
        <text x={SVG_W / 2} y={SVG_H - 8} fontSize={11} fill="#64748b" textAnchor="middle">
          פופולריות (כמות מכירות)
        </text>
        <text
          x={14}
          y={SVG_H / 2}
          fontSize={11}
          fill="#64748b"
          textAnchor="middle"
          transform={`rotate(-90, 14, ${SVG_H / 2})`}
        >
          רווחיות (מרווח גולמי %)
        </text>

        {/* Dish circles */}
        {dishes.map((dish) => {
          const cx = toSvgX(dish.popularity)
          const cy = toSvgY(dish.profitability)
          const r = Math.max(6, Math.min(22, (dish.popularity / maxRadius) * 18 + 6))
          const color = QUADRANT_COLORS[dish.quadrant] ?? '#94a3b8'

          return (
            <circle
              key={dish.recipeId}
              cx={cx}
              cy={cy}
              r={r}
              fill={color}
              fillOpacity={0.7}
              stroke={color}
              strokeWidth={1.5}
              className="cursor-pointer hover:fillOpacity-100 transition-opacity"
              onMouseEnter={(e) => {
                const svg = (e.target as SVGCircleElement).closest('svg')!
                const rect = svg.getBoundingClientRect()
                const scale = rect.width / SVG_W
                setTooltip({ dish, x: cx * scale, y: cy * scale })
              }}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => onSelectDish?.(dish)}
              aria-label={dish.name}
            />
          )
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute bg-foreground text-white text-xs rounded-md px-2 py-1.5 pointer-events-none shadow"
          style={{ left: tooltip.x + 12, top: tooltip.y - 20 }}
        >
          <p className="font-medium">{tooltip.dish.name}</p>
          <p>{QUADRANT_COLORS[tooltip.dish.quadrant] ? tooltip.dish.quadrant : ''}</p>
        </div>
      )}
    </div>
  )
}
