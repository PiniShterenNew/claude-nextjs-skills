import Decimal from 'decimal.js'

/**
 * Calculate the effective price per unit including waste percentage.
 * effectivePrice = pricePerUnit × (1 + wastePercent / 100)
 */
export function effectivePrice(
  pricePerUnit: Decimal | number | string,
  wastePercent: Decimal | number | string
): Decimal {
  const price = new Decimal(pricePerUnit.toString())
  const waste = new Decimal(wastePercent.toString())
  return price.mul(new Decimal(1).add(waste.div(100)))
}
