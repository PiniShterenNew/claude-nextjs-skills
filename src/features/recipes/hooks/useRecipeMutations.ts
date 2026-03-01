'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/shared/components/ui/Toast'
import { createRecipe } from '../actions/create-recipe'
import { updateRecipe } from '../actions/update-recipe'
import { deleteRecipe } from '../actions/delete-recipe'
import { recipeKeys } from './useRecipes'

export function useRecipeMutations(workspaceId: string) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: recipeKeys.all(workspaceId) })

  const create = useMutation({
    mutationFn: (input: unknown) => createRecipe(input),
    onSuccess: (result) => {
      if (result.success) { toast.success('מתכון נוצר בהצלחה'); void invalidate() }
      else toast.error(result.error)
    },
    onError: () => toast.error('שגיאה בלתי צפויה'),
  })

  const update = useMutation({
    mutationFn: (input: unknown) => updateRecipe(input),
    onSuccess: (result) => {
      if (result.success) { toast.success('מתכון עודכן בהצלחה'); void invalidate() }
      else toast.error(result.error)
    },
    onError: () => toast.error('שגיאה בלתי צפויה'),
  })

  const remove = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteRecipe(id, workspaceId),
    onSuccess: (result) => {
      if (result.success) { toast.success('מתכון נמחק'); void invalidate() }
      else toast.error(result.error)
    },
    onError: () => toast.error('שגיאה בלתי צפויה'),
  })

  return { createRecipe: create, updateRecipe: update, deleteRecipe: remove }
}
