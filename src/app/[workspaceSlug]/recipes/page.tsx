import { redirect } from 'next/navigation'
import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { Header } from '@/shared/components/layout/Header'
import { RecipeListPage } from '@/features/recipes/components/RecipeListPage'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ workspaceSlug: string }>
  searchParams: Promise<{ category?: string }>
}

export default async function RecipesRoute({ params, searchParams }: PageProps) {
  const { workspaceSlug } = await params
  const { category } = await searchParams
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
      <Header title="מתכונים" />
      <div className="p-6">
        <RecipeListPage
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          role={member.role as 'OWNER' | 'MANAGER' | 'CHEF' | 'VIEWER'}
          category={category}
        />
      </div>
    </>
  )
}
