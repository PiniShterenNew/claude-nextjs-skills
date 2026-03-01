import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { effectivePrice } from './effective-price'

describe('effectivePrice', () => {
  it('returns the same price when waste is 0%', () => {
    const result = effectivePrice(10, 0)
    expect(result.equals(new Decimal(10))).toBe(true)
  })

  it('returns 1.5× price when waste is 50%', () => {
    const result = effectivePrice(10, 50)
    expect(result.equals(new Decimal(15))).toBe(true)
  })

  it('returns 2× price when waste is 100%', () => {
    const result = effectivePrice(10, 100)
    expect(result.equals(new Decimal(20))).toBe(true)
  })

  it('handles decimal price and waste values', () => {
    // 5.00 * (1 + 0.2/100) = 5.00 * 1.002 = 5.01
    const result = effectivePrice('5.00', '0.2')
    expect(result.toNumber()).toBeCloseTo(5.01, 5)
  })

  it('accepts Decimal instances as arguments', () => {
    const result = effectivePrice(new Decimal('100'), new Decimal('25'))
    expect(result.equals(new Decimal('125'))).toBe(true)
  })

  it('returns Decimal instance', () => {
    const result = effectivePrice(10, 0)
    expect(result).toBeInstanceOf(Decimal)
  })
})
