import { redirect } from 'next/navigation'
import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { Header } from '@/shared/components/layout/Header'
import { RecipeBuilder } from '@/features/recipes/components/RecipeBuilder'
import { getRecipe } from '@/features/recipes/actions/get-recipe'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ workspaceSlug: string; id: string }>
}

export default async function EditRecipePage({ params }: PageProps) {
  const { workspaceSlug, id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } })
  if (!workspace) redirect('/onboarding')

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: session.user.id } },
  })
  if (!member) redirect('/login')
  if (member.role === 'VIEWER') redirect(`/${workspaceSlug}/recipes/${id}`)

  const recipeResult = await getRecipe(id, workspace.id)
  if (!recipeResult.success) redirect(`/${workspaceSlug}/recipes`)

  const canViewCosts = ['OWNER', 'MANAGER'].includes(member.role)

  return (
    <>
      <Header title={`ערוך: ${recipeResult.data.name}`} />
      <div className="p-6">
        <RecipeBuilder
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          initialRecipe={recipeResult.data}
          canViewCosts={canViewCosts}
        />
      </div>
    </>
  )
}
