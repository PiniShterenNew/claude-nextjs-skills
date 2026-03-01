import { redirect } from 'next/navigation'
import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { Header } from '@/shared/components/layout/Header'
import { RecipeDetailPage } from '@/features/recipes/components/RecipeDetailPage'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ workspaceSlug: string; id: string }>
}

export default async function RecipeDetailRoute({ params }: PageProps) {
  const { workspaceSlug, id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } })
  if (!workspace) redirect('/onboarding')

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: session.user.id } },
  })
  if (!member) redirect('/login')

  return (
    <>
      <Header />
      <div className="p-6">
        <RecipeDetailPage
          recipeId={id}
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          role={member.role as 'OWNER' | 'MANAGER' | 'CHEF' | 'VIEWER'}
        />
      </div>
    </>
  )
}
