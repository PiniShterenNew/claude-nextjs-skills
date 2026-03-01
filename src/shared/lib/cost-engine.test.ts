import { describe, it, expect } from 'vitest'
import { calculateRecipeCost } from './cost-engine'
import type { CostEngineRecipe, CostEngineIngredient } from './cost-engine'
import type { UnitConversion } from '@prisma/client'
import Decimal from 'decimal.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeDecimalLike(value: string) {
  return { toString: () => value }
}

const noConversions: UnitConversion[] = []

const kgToG: UnitConversion = {
  id: 'conv_1',
  fromUnit: 'kg',
  toUnit: 'g',
  factor: new Decimal(1000) as unknown as UnitConversion['factor'],
}

function makeIngredient(
  id: string,
  pricePerUnit: string,
  wastePercent = '0',
  unit = 'g'
): CostEngineIngredient {
  return {
    id,
    name: `Ingredient ${id}`,
    unit,
    pricePerUnit: makeDecimalLike(pricePerUnit),
    wastePercent: makeDecimalLike(wastePercent),
  }
}

function makeRecipe(
  id: string,
  overrides: Partial<CostEngineRecipe> = {}
): CostEngineRecipe {
  return {
    id,
    name: `Recipe ${id}`,
    yield: makeDecimalLike('1'),
    yieldUnit: 'portion',
    isSubRecipe: false,
    sellingPrice: makeDecimalLike('100'),
    vatPercent: makeDecimalLike('0'),
    laborCost: null,
    overheadCost: null,
    salesVolume: null,
    costStaleSince: null,
    items: [],
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('calculateRecipeCost', () => {
  describe('flat recipe — single ingredient', () => {
    it('calculates correct ingredient cost with no waste', () => {
      const ingredient = makeIngredient('ing_1', '10', '0')
      const recipe = makeRecipe('rec_1', {
        items: [
          {
            id: 'item_1',
            ingredientId: 'ing_1',
            subRecipeId: null,
            quantity: makeDecimalLike('2'),
            unit: 'g',
          },
        ],
      })

      const recipesMap = new Map([['rec_1', recipe]])
      const ingredientsMap = new Map([['ing_1', ingredient]])

      const result = calculateRecipeCost('rec_1', recipesMap, ingredientsMap, noConversions)

      // ingredientCost = 2g * ₪10/g = ₪20, yield = 1 portion → ₪20/portion
      expect(result.ingredientCost).toBeCloseTo(20)
      expect(result.recipeId).toBe('rec_1')
    })

    it('applies waste percentage to ingredient cost', () => {
      // pricePerUnit=10, wastePercent=50 → effectivePrice = 10 * 1.5 = 15
      const ingredient = makeIngredient('ing_1', '10', '50')
      const recipe = makeRecipe('rec_1', {
        items: [
          {
            id: 'item_1',
            ingredientId: 'ing_1',
            subRecipeId: null,
            quantity: makeDecimalLike('2'),
            unit: 'g',
          },
        ],
      })

      const recipesMap = new Map([['rec_1', recipe]])
      const ingredientsMap = new Map([['ing_1', ingredient]])

      const result = calculateRecipeCost('rec_1', recipesMap, ingredientsMap, noConversions)
      // cost = 2 * 15 = 30, per portion (yield=1) = 30
      expect(result.ingredientCost).toBeCloseTo(30)
    })

    it('includes labor and overhead in totalCost', () => {
      const ingredient = makeIngredient('ing_1', '10', '0')
      const recipe = makeRecipe('rec_1', {
        laborCost: makeDecimalLike('5'),
        overheadCost: makeDecimalLike('3'),
        items: [
          {
            id: 'item_1',
            ingredientId: 'ing_1',
            subRecipeId: null,
            quantity: makeDecimalLike('1'),
            unit: 'g',
          },
        ],
      })

      const recipesMap = new Map([['rec_1', recipe]])
      const ingredientsMap = new Map([['ing_1', ingredient]])

      const result = calculateRecipeCost('rec_1', recipesMap, ingredientsMap, noConversions)
      // ingredientCost=10, labor=5, overhead=3, total=18
      expect(result.ingredientCost).toBeCloseTo(10)
      expect(result.laborCost).toBeCloseTo(5)
      expect(result.overheadCost).toBeCloseTo(3)
      expect(result.totalCost).toBeCloseTo(18)
    })
  })

  describe('nested sub-recipe (2 levels)', () => {
    it('correctly propagates sub-recipe cost', () => {
      // Sub-recipe: 1g of ing_1 at ₪10/g → cost = ₪10, yield = 2
      // Parent: uses 1 unit of sub-recipe
      const ingredient = makeIngredient('ing_1', '10', '0')

      const subRecipe = makeRecipe('sub_1', {
        isSubRecipe: true,
        sellingPrice: null,
        yield: makeDecimalLike('2'), // yield 2 portions
        items: [
          {
            id: 'sub_item_1',
            ingredientId: 'ing_1',
            subRecipeId: null,
            quantity: makeDecimalLike('1'),
            unit: 'g',
          },
        ],
      })

      const parentRecipe = makeRecipe('rec_1', {
        items: [
          {
            id: 'item_1',
            ingredientId: null,
            subRecipeId: 'sub_1',
            quantity: makeDecimalLike('1'),
            unit: 'g',
          },
        ],
      })

      const recipesMap = new Map([
        ['rec_1', parentRecipe],
        ['sub_1', subRecipe],
      ])
      const ingredientsMap = new Map([['ing_1', ingredient]])

      const result = calculateRecipeCost('rec_1', recipesMap, ingredientsMap, noConversions)

      // sub cost = 10, sub yield = 2 → cost per unit = 5
      // parent uses 1 unit → ingredientCost = 5
      expect(result.ingredientCost).toBeCloseTo(5)
    })
  })

  describe('unit conversion', () => {
    it('applies unit conversion factor between item unit and ingredient unit', () => {
      // ingredient unit = g, item unit = kg, quantity = 0.5 kg = 500g
      // price = 10/g → cost = 500 * 10 = 5000
      const ingredient = makeIngredient('ing_1', '10', '0', 'g')
      const recipe = makeRecipe('rec_1', {
        items: [
          {
            id: 'item_1',
            ingredientId: 'ing_1',
            subRecipeId: null,
            quantity: makeDecimalLike('0.5'),
            unit: 'kg',
          },
        ],
      })

      const recipesMap = new Map([['rec_1', recipe]])
      const ingredientsMap = new Map([['ing_1', ingredient]])

      const result = calculateRecipeCost('rec_1', recipesMap, ingredientsMap, [kgToG])
      expect(result.ingredientCost).toBeCloseTo(5000)
    })
  })

  describe('food cost and margin calculations', () => {
    it('calculates foodCostPercent correctly', () => {
      // ingredientCost=20, sellingPrice=100 → foodCostPercent = 20%
      const ingredient = makeIngredient('ing_1', '20', '0')
      const recipe = makeRecipe('rec_1', {
        sellingPrice: makeDecimalLike('100'),
        items: [
          {
            id: 'item_1',
            ingredientId: 'ing_1',
            subRecipeId: null,
            quantity: makeDecimalLike('1'),
            unit: 'g',
          },
        ],
      })

      const recipesMap = new Map([['rec_1', recipe]])
      const ingredientsMap = new Map([['ing_1', ingredient]])

      const result = calculateRecipeCost('rec_1', recipesMap, ingredientsMap, noConversions)
      expect(result.foodCostPercent).toBeCloseTo(20)
      expect(result.grossMargin).toBeCloseTo(80)
    })

    it('returns 0 for margins when sellingPrice is 0', () => {
      const ingredient = makeIngredient('ing_1', '10', '0')
      const recipe = makeRecipe('rec_1', {
        sellingPrice: makeDecimalLike('0'),
        items: [
          {
            id: 'item_1',
            ingredientId: 'ing_1',
            subRecipeId: null,
            quantity: makeDecimalLike('1'),
            unit: 'g',
          },
        ],
      })

      const recipesMap = new Map([['rec_1', recipe]])
      const ingredientsMap = new Map([['ing_1', ingredient]])

      const result = calculateRecipeCost('rec_1', recipesMap, ingredientsMap, noConversions)
      expect(result.foodCostPercent).toBe(0)
      expect(result.grossMargin).toBe(0)
      expect(result.netMargin).toBe(0)
    })
  })

  describe('error cases', () => {
    it('throws when recipe is not found', () => {
      const recipesMap = new Map<string, CostEngineRecipe>()
      const ingredientsMap = new Map<string, CostEngineIngredient>()
      expect(() => calculateRecipeCost('nonexistent', recipesMap, ingredientsMap, noConversions)).toThrow()
    })

    it('throws descriptive error when unit conversion not found', () => {
      const ingredient = makeIngredient('ing_1', '10', '0', 'g')
      const recipe = makeRecipe('rec_1', {
        items: [
          {
            id: 'item_1',
            ingredientId: 'ing_1',
            subRecipeId: null,
            quantity: makeDecimalLike('1'),
            unit: 'liter', // no conversion liter → g
          },
        ],
      })

      const recipesMap = new Map([['rec_1', recipe]])
      const ingredientsMap = new Map([['ing_1', ingredient]])

      expect(() =>
        calculateRecipeCost('rec_1', recipesMap, ingredientsMap, noConversions)
      ).toThrow(/liter/)
    })
  })

  describe('stale flag', () => {
    it('returns isStale=true when costStaleSince is set', () => {
      const ingredient = makeIngredient('ing_1', '10', '0')
      const recipe = makeRecipe('rec_1', {
        costStaleSince: new Date(),
        items: [],
      })

      const recipesMap = new Map([['rec_1', recipe]])
      const ingredientsMap = new Map([['ing_1', ingredient]])

      const result = calculateRecipeCost('rec_1', recipesMap, ingredientsMap, noConversions)
      expect(result.isStale).toBe(true)
    })

    it('returns isStale=false when costStaleSince is null', () => {
      const recipe = makeRecipe('rec_1', { costStaleSince: null, items: [] })
      const recipesMap = new Map([['rec_1', recipe]])
      const ingredientsMap = new Map<string, CostEngineIngredient>()

      const result = calculateRecipeCost('rec_1', recipesMap, ingredientsMap, noConversions)
      expect(result.isStale).toBe(false)
    })
  })
})
