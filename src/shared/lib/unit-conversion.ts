import type { UnitConversion } from '@prisma/client'
import Decimal from 'decimal.js'

/**
 * Get the conversion factor to convert `quantity` in `fromUnit` to `toUnit`.
 * Returns 1 if units are identical.
 * Throws a descriptive error if no conversion path is found.
 */
export function getConversionFactor(
  fromUnit: string,
  toUnit: string,
  conversions: UnitConversion[]
): Decimal {
  if (fromUnit === toUnit) return new Decimal(1)

  const match = conversions.find(
    (c) => c.fromUnit === fromUnit && c.toUnit === toUnit
  )

  if (!match) {
    throw new Error(
      `אין המרה מוגדרת מ-"${fromUnit}" ל-"${toUnit}". ` +
        `השתמש ביחידות תואמות או הוסף המרה ידנית.`
    )
  }

  return new Decimal(match.factor.toString())
}
