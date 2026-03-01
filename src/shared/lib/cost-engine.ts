import Decimal from 'decimal.js'
import type { UnitConversion } from '@prisma/client'
import type { RecipeCostResult, RecipeCostLineItem } from '@/shared/types'
import { getConversionFactor } from './unit-conversion'

// ─── Input types for the pure cost engine ────────────────────────────────────

export interface CostEngineIngredient {
  id: string
  name: string
  unit: string
  pricePerUnit: { toString(): string } // Decimal or Prisma Decimal
  wastePercent: { toString(): string }
}

export interface CostEngineRecipeItem {
  id: string
  ingredientId: string | null
  subRecipeId: string | null
  quantity: { toString(): string }
  unit: string
}

export interface CostEngineRecipe {
  id: string
  name: string
  yield: { toString(): string }
  yieldUnit: string
  isSubRecipe: boolean
  sellingPrice: { toString(): string } | null
  vatPercent: { toString(): string } | null
  laborCost: { toString(): string } | null
  overheadCost: { toString(): string } | null
  salesVolume: number | null
  costStaleSince: Date | null
  items: CostEngineRecipeItem[]
}

// ─── Core calculation ─────────────────────────────────────────────────────────

const MAX_DEPTH = 10

/**
 * Calculate the total ingredient cost (per batch, not per portion) of a recipe.
 * Pure function — no DB calls, no side effects.
 *
 * @param recipeId    - The recipe to calculate cost for
 * @param recipesMap  - Map of recipeId → recipe (must include all sub-recipes transitively)
 * @param ingredientsMap - Map of ingredientId → ingredient
 * @param conversionsMap - Array of UnitConversion rows (from DB seed)
 * @param depth       - Internal recursion depth guard (do not pass externally)
 */
function calcIngredientCost(
  recipeId: string,
  recipesMap: Map<string, CostEngineRecipe>,
  ingredientsMap: Map<string, CostEngineIngredient>,
  conversionsMap: UnitConversion[],
  depth = 0
): { cost: Decimal; lines: RecipeCostLineItem[] } {
  if (depth > MAX_DEPTH) {
    throw new Error(
      `עומק ניסיון קינון עבר ${MAX_DEPTH} רמות. בדוק אם יש לולאה מעגלית.`
    )
  }

  const recipe = recipesMap.get(recipeId)
  if (!recipe) {
    throw new Error(`מתכון עם מזהה "${recipeId}" לא נמצא בנתונים שסופקו.`)
  }

  let total = new Decimal(0)
  const lines: RecipeCostLineItem[] = []

  for (const item of recipe.items) {
    const quantity = new Decimal(item.quantity.toString())

    if (item.ingredientId !== null) {
      // ── Ingredient line ──
      const ingredient = ingredientsMap.get(item.ingredientId)
      if (!ingredient) {
        throw new Error(
          `חומר גלם עם מזהה "${item.ingredientId}" לא נמצא בנתונים שסופקו.`
        )
      }

      const pricePerUnit = new Decimal(ingredient.pricePerUnit.toString())
      const wastePercent = new Decimal(ingredient.wastePercent.toString())
      const effectivePrice = pricePerUnit.mul(
        new Decimal(1).add(wastePercent.div(100))
      )

      // Convert item unit → ingredient unit
      const factor = getConversionFactor(
        item.unit,
        ingredient.unit,
        conversionsMap
      )
      const lineCost = quantity.mul(factor).mul(effectivePrice)
      total = total.add(lineCost)

      lines.push({
        ingredientId: item.ingredientId,
        subRecipeId: null,
        name: ingredient.name,
        quantity: quantity.toNumber(),
        unit: item.unit,
        unitCostILS: effectivePrice.toNumber(),
        totalCostILS: lineCost.toNumber(),
      })
    } else if (item.subRecipeId !== null) {
      // ── Sub-recipe line ──
      const subRecipe = recipesMap.get(item.subRecipeId)
      if (!subRecipe) {
        throw new Error(
          `מתכון-משנה עם מזהה "${item.subRecipeId}" לא נמצא בנתונים שסופקו.`
        )
      }

      const subResult = calcIngredientCost(
        item.subRecipeId,
        recipesMap,
        ingredientsMap,
        conversionsMap,
        depth + 1
      )
      const subYield = new Decimal(subRecipe.yield.toString())
      const costPerYieldUnit = subResult.cost.div(subYield)
      const lineCost = quantity.mul(costPerYieldUnit)
      total = total.add(lineCost)

      lines.push({
        ingredientId: null,
        subRecipeId: item.subRecipeId,
        name: subRecipe.name,
        quantity: quantity.toNumber(),
        unit: item.unit,
        unitCostILS: costPerYieldUnit.toNumber(),
        totalCostILS: lineCost.toNumber(),
      })
    }
  }

  return { cost: total, lines }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Calculate the full cost result for a recipe.
 * Returns per-portion costs and profitability metrics.
 */
export function calculateRecipeCost(
  recipeId: string,
  recipesMap: Map<string, CostEngineRecipe>,
  ingredientsMap: Map<string, CostEngineIngredient>,
  conversionsMap: UnitConversion[]
): RecipeCostResult {
  const recipe = recipesMap.get(recipeId)
  if (!recipe) {
    throw new Error(`מתכון עם מזהה "${recipeId}" לא נמצא.`)
  }

  const yieldQty = new Decimal(recipe.yield.toString())
  const { cost: totalIngredientCostBatch, lines } = calcIngredientCost(
    recipeId,
    recipesMap,
    ingredientsMap,
    conversionsMap
  )

  const ingredientCostPerPortion = totalIngredientCostBatch.div(yieldQty)
  const laborCostPerPortion = recipe.laborCost
    ? new Decimal(recipe.laborCost.toString())
    : new Decimal(0)
  const overheadCostPerPortion = recipe.overheadCost
    ? new Decimal(recipe.overheadCost.toString())
    : new Decimal(0)

  const totalCost = ingredientCostPerPortion
    .add(laborCostPerPortion)
    .add(overheadCostPerPortion)

  const sellingPrice = recipe.sellingPrice
    ? new Decimal(recipe.sellingPrice.toString())
    : new Decimal(0)

  const vatPercent = recipe.vatPercent
    ? new Decimal(recipe.vatPercent.toString())
    : new Decimal(0)

  const sellingPriceWithVAT = sellingPrice.mul(
    new Decimal(1).add(vatPercent.div(100))
  )

  const grossProfit = sellingPrice.sub(ingredientCostPerPortion)
  const grossMargin = sellingPrice.gt(0)
    ? grossProfit.div(sellingPrice).mul(100)
    : new Decimal(0)
  const foodCostPercent = sellingPrice.gt(0)
    ? ingredientCostPerPortion.div(sellingPrice).mul(100)
    : new Decimal(0)
  const netProfit = sellingPrice.sub(totalCost)
  const netMargin = sellingPrice.gt(0)
    ? netProfit.div(sellingPrice).mul(100)
    : new Decimal(0)

  return {
    recipeId,
    ingredientCost: ingredientCostPerPortion.toNumber(),
    laborCost: laborCostPerPortion.toNumber(),
    overheadCost: overheadCostPerPortion.toNumber(),
    totalCost: totalCost.toNumber(),
    sellingPrice: sellingPrice.toNumber(),
    sellingPriceWithVAT: sellingPriceWithVAT.toNumber(),
    grossProfit: grossProfit.toNumber(),
    grossMargin: grossMargin.toNumber(),
    foodCostPercent: foodCostPercent.toNumber(),
    netProfit: netProfit.toNumber(),
    netMargin: netMargin.toNumber(),
    isStale: recipe.costStaleSince !== null,
    computedAt: new Date().toISOString(),
    breakdown: lines,
  }
}
