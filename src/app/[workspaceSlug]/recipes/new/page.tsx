import { redirect } from 'next/navigation'
import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { Header } from '@/shared/components/layout/Header'
import { RecipeBuilder } from '@/features/recipes/components/RecipeBuilder'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ workspaceSlug: string }>
}

export default async function NewRecipePage({ params }: PageProps) {
  const { workspaceSlug } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } })
  if (!workspace) redirect('/onboarding')

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: session.user.id } },
  })
  if (!member) redirect('/login')
  if (member.role === 'VIEWER') redirect(`/${workspaceSlug}/recipes`)

  const canViewCosts = ['OWNER', 'MANAGER'].includes(member.role)

  return (
    <>
      <Header title="מתכון חדש" />
      <div className="p-6">
        <RecipeBuilder
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          canViewCosts={canViewCosts}
        />
      </div>
    </>
  )
}
