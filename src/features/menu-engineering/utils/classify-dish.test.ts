import { describe, it, expect } from 'vitest'
import { classifyDish } from './classify-dish'

describe('classifyDish', () => {
  describe('STAR — above avg profitability and above avg popularity', () => {
    it('classifies as STAR when both metrics exceed averages', () => {
      expect(classifyDish(80, 60, 100, 80)).toBe('STAR')
    })

    it('classifies as STAR when exactly at average on both axes (boundary)', () => {
      expect(classifyDish(60, 60, 80, 80)).toBe('STAR')
    })
  })

  describe('PUZZLE — above avg profitability, below avg popularity', () => {
    it('classifies as PUZZLE when profitability is high but popularity is low', () => {
      expect(classifyDish(80, 60, 50, 80)).toBe('PUZZLE')
    })
  })

  describe('WORKHORSE — below avg profitability, above avg popularity', () => {
    it('classifies as WORKHORSE when popular but low margin', () => {
      expect(classifyDish(40, 60, 100, 80)).toBe('WORKHORSE')
    })
  })

  describe('DOG — below avg on both axes', () => {
    it('classifies as DOG when both metrics are below average', () => {
      expect(classifyDish(30, 60, 50, 80)).toBe('DOG')
    })
  })

  describe('boundary values at exact average', () => {
    it('exact average profitability with above avg popularity → STAR', () => {
      expect(classifyDish(60, 60, 90, 80)).toBe('STAR')
    })

    it('above avg profitability with exact average popularity → PUZZLE', () => {
      // popularity === avgPopularity → highPopularity is true (>=), so STAR
      expect(classifyDish(70, 60, 80, 80)).toBe('STAR')
    })

    it('below avg profitability with exact average popularity → WORKHORSE', () => {
      expect(classifyDish(50, 60, 80, 80)).toBe('WORKHORSE')
    })
  })
})
