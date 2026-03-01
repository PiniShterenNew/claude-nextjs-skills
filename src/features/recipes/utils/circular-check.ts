import type { RecipeWithItems } from '../types'

/**
 * Detect if adding `newSubRecipeId` as a sub-recipe of `parentRecipeId`
 * would create a circular reference in the recipe dependency graph.
 *
 * @returns true if a circular reference would be created (should prevent save)
 */
export function detectCircularRef(
  parentRecipeId: string,
  newSubRecipeId: string,
  allRecipes: RecipeWithItems[]
): boolean {
  const recipeMap = new Map(allRecipes.map((r) => [r.id, r]))
  const visited = new Set<string>()

  // Traverse sub-recipe tree starting from newSubRecipeId
  // If we encounter parentRecipeId, it's circular
  function dfs(recipeId: string): boolean {
    if (recipeId === parentRecipeId) return true
    if (visited.has(recipeId)) return false
    visited.add(recipeId)

    const recipe = recipeMap.get(recipeId)
    if (!recipe) return false

    for (const item of recipe.items) {
      if (item.subRecipeId && dfs(item.subRecipeId)) {
        return true
      }
    }
    return false
  }

  return dfs(newSubRecipeId)
}
