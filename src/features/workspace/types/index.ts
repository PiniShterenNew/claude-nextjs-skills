import { z } from 'zod'
import type { WorkspaceRole } from '@/shared/types'

export const CreateWorkspaceInputSchema = z.object({
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים').max(100),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug חייב להכיל אותיות קטנות, מספרים ומקפים בלבד'),
})
export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceInputSchema>

export const UpdateWorkspaceInputSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(100).optional(),
  foodCostThreshold: z.number().min(0).max(100).optional(),
})
export type UpdateWorkspaceInput = z.infer<typeof UpdateWorkspaceInputSchema>

export const InviteMemberInputSchema = z.object({
  workspaceId: z.string(),
  email: z.string().email('כתובת אימייל לא תקינה'),
  role: z.enum(['OWNER', 'MANAGER', 'CHEF', 'VIEWER'] as const),
})
export type InviteMemberInput = z.infer<typeof InviteMemberInputSchema>

export const UpdateMemberRoleInputSchema = z.object({
  memberId: z.string(),
  workspaceId: z.string(),
  role: z.enum(['OWNER', 'MANAGER', 'CHEF', 'VIEWER'] as const),
})
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleInputSchema>

export const RemoveMemberInputSchema = z.object({
  memberId: z.string(),
  workspaceId: z.string(),
})
export type RemoveMemberInput = z.infer<typeof RemoveMemberInputSchema>

export interface MemberRow {
  id: string
  user: { id: string; name: string; email: string }
  role: WorkspaceRole
  invitedAt: Date
  acceptedAt: Date | null
}
