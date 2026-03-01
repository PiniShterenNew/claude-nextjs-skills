import { Badge } from '@/shared/components/ui/Badge'
import type { Quadrant } from '../types'

interface QuadrantLabelProps {
  quadrant: Quadrant
}

const LABELS: Record<Quadrant, string> = {
  STAR: 'כוכב',
  WORKHORSE: 'עובד חרוץ',
  PUZZLE: 'חידה',
  DOG: 'כלב',
}

const VARIANTS: Record<Quadrant, 'success' | 'info' | 'warning' | 'destructive'> = {
  STAR: 'success',
  WORKHORSE: 'info',
  PUZZLE: 'warning',
  DOG: 'destructive',
}

export function QuadrantLabel({ quadrant }: QuadrantLabelProps) {
  return <Badge variant={VARIANTS[quadrant]}>{LABELS[quadrant]}</Badge>
}
