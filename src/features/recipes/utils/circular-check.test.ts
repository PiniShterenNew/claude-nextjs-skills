import { describe, it, expect } from 'vitest'
import { detectCircularRef } from './circular-check'
import type { RecipeWithItems } from '../types'

// Helper to build minimal RecipeWithItems fixtures
function makeRecipe(id: string, subRecipeIds: string[] = []): RecipeWithItems {
  return {
    id,
    workspaceId: 'ws_1',
    name: `Recipe ${id}`,
    category: null,
    yield: 1,
    yieldUnit: 'portion',
    isSubRecipe: subRecipeIds.length > 0,
    sellingPrice: null,
    vatPercent: null,
    laborCost: null,
    overheadCost: null,
    salesVolume: null,
    costStaleSince: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: subRecipeIds.map((subId, i) => ({
      id: `item_${id}_${i}`,
      recipeId: id,
      ingredientId: null,
      subRecipeId: subId,
      quantity: 1,
      unit: 'g',
    })),
  }
}

describe('detectCircularRef', () => {
  it('returns false when there is no circular reference (simple tree)', () => {
    // A → B → C  (no cycle)
    const recipes = [makeRecipe('A', ['B']), makeRecipe('B', ['C']), makeRecipe('C')]
    expect(detectCircularRef('A', 'B', recipes)).toBe(false)
  })

  it('detects a direct cycle (A → B, add B → A)', () => {
    // Existing: A → B. Now trying to add B → A.
    const recipes = [makeRecipe('A', ['B']), makeRecipe('B')]
    expect(detectCircularRef('B', 'A', recipes)).toBe(true)
  })

  it('detects a transitive cycle (A → B → C, add C → A)', () => {
    const recipes = [makeRecipe('A', ['B']), makeRecipe('B', ['C']), makeRecipe('C')]
    expect(detectCircularRef('C', 'A', recipes)).toBe(true)
  })

  it('detects self-reference (add A → A)', () => {
    const recipes = [makeRecipe('A')]
    expect(detectCircularRef('A', 'A', recipes)).toBe(true)
  })

  it('returns false for independent recipes (no shared sub-recipes)', () => {
    const recipes = [makeRecipe('A', ['B']), makeRecipe('B'), makeRecipe('C', ['D']), makeRecipe('D')]
    expect(detectCircularRef('A', 'C', recipes)).toBe(false)
  })

  it('returns false when newSubRecipeId does not exist in the map', () => {
    const recipes = [makeRecipe('A')]
    expect(detectCircularRef('A', 'NONEXISTENT', recipes)).toBe(false)
  })

  it('handles a diamond dependency without false positives', () => {
    // A → B, A → C, B → D, C → D  (D visited twice via different paths)
    const recipes = [
      makeRecipe('A', ['B', 'C']),
      makeRecipe('B', ['D']),
      makeRecipe('C', ['D']),
      makeRecipe('D'),
    ]
    // Adding E → A should not cause circular detection
    const withE = [...recipes, makeRecipe('E')]
    expect(detectCircularRef('E', 'A', withE)).toBe(false)
  })
})
