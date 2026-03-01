import Decimal from 'decimal.js'

// Configure Decimal for financial calculations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

export { Decimal }

/**
 * Format a Decimal (or number/string) as Israeli Shekel.
 * e.g. toDecimal(12.5) → "₪12.50"
 */
export function formatILS(value: Decimal | number | string): string {
  const d = value instanceof Decimal ? value : new Decimal(value)
  return `₪${d.toFixed(2)}`
}

/**
 * Convert a number or string to a Decimal instance.
 */
export function toDecimal(n: number | string): Decimal {
  return new Decimal(n)
}

/**
 * Round a Decimal to 4 decimal places (standard for unit prices).
 */
export function roundPrice(value: Decimal): Decimal {
  return value.toDecimalPlaces(4, Decimal.ROUND_HALF_UP)
}

/**
 * Round a Decimal to 2 decimal places (standard for display).
 */
export function roundDisplay(value: Decimal): Decimal {
  return value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
}
