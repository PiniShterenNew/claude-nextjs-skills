import { redirect } from 'next/navigation'
import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { AppShell } from '@/shared/components/layout/AppShell'

interface WorkspaceLayoutProps {
  children: React.ReactNode
  params: Promise<{ workspaceSlug: string }>
}

export const dynamic = 'force-dynamic'

export default async function WorkspaceLayout({ children, params }: WorkspaceLayoutProps) {
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
    <AppShell workspaceSlug={workspaceSlug}>
      <div className="p-6">{children}</div>
    </AppShell>
  )
}
