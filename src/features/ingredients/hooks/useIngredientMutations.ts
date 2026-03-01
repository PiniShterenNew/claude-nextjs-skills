'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/shared/components/ui/Toast'
import { createIngredient } from '../actions/create-ingredient'
import { updateIngredient } from '../actions/update-ingredient'
import { deleteIngredient } from '../actions/delete-ingredient'
import { ingredientKeys } from './useIngredients'

export function useIngredientMutations(workspaceId: string) {
  const qc = useQueryClient()

  const invalidate = () => qc.invalidateQueries({ queryKey: ingredientKeys.all(workspaceId) })

  const create = useMutation({
    mutationFn: (input: unknown) => createIngredient(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('חומר גלם נוצר בהצלחה')
        void invalidate()
      } else {
        toast.error(result.error)
      }
    },
    onError: () => toast.error('שגיאה בלתי צפויה'),
  })

  const update = useMutation({
    mutationFn: (input: unknown) => updateIngredient(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('חומר גלם עודכן בהצלחה')
        void invalidate()
      } else {
        toast.error(result.error)
      }
    },
    onError: () => toast.error('שגיאה בלתי צפויה'),
  })

  const remove = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteIngredient(id, workspaceId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('חומר גלם נמחק')
        void invalidate()
      } else {
        toast.error(result.error)
      }
    },
    onError: () => toast.error('שגיאה בלתי צפויה'),
  })

  return { createIngredient: create, updateIngredient: update, deleteIngredient: remove }
}
