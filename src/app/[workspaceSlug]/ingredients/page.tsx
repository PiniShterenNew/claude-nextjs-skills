import { redirect } from 'next/navigation'
import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { Header } from '@/shared/components/layout/Header'
import { IngredientListPage } from '@/features/ingredients/components/IngredientListPage'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ workspaceSlug: string }>
}

export default async function IngredientsRoute({ params }: PageProps) {
  const { workspaceSlug } = await params
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
      <Header title="חומרי גלם" />
      <div className="p-6">
        <IngredientListPage
          workspaceId={workspace.id}
          role={member.role as 'OWNER' | 'MANAGER' | 'CHEF' | 'VIEWER'}
        />
      </div>
    </>
  )
}
