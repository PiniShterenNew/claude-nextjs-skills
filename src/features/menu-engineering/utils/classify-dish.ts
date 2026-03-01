import type { Quadrant } from '../types'

/**
 * Classify a dish into one of 4 Boston Matrix quadrants.
 *
 * - STAR:      above avg profitability AND above avg popularity
 * - PUZZLE:    above avg profitability AND below avg popularity (high margin, low volume)
 * - WORKHORSE: below avg profitability AND above avg popularity (popular but low margin)
 * - DOG:       below avg profitability AND below avg popularity
 */
export function classifyDish(
  profitability: number,
  avgProfitability: number,
  popularity: number,
  avgPopularity: number
): Quadrant {
  const highProfit = profitability >= avgProfitability
  const highPopularity = popularity >= avgPopularity

  if (highProfit && highPopularity) return 'STAR'
  if (highProfit && !highPopularity) return 'PUZZLE'
  if (!highProfit && highPopularity) return 'WORKHORSE'
  return 'DOG'
}
