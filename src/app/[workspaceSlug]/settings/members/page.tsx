import { redirect } from 'next/navigation'
import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { Header } from '@/shared/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card'
import { MemberList } from '@/features/workspace/components/MemberList'
import { InviteMemberForm } from '@/features/workspace/components/InviteMemberForm'
import type { MemberRow } from '@/features/workspace/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ workspaceSlug: string }>
}

export default async function MembersSettingsRoute({ params }: PageProps) {
  const { workspaceSlug } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } })
  if (!workspace) redirect('/onboarding')

  const callerMember = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: session.user.id } },
  })
  if (!callerMember) redirect('/login')

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { invitedAt: 'asc' },
  })

  const memberRows: MemberRow[] = members.map((m) => ({
    id: m.id,
    user: { id: m.user.id, name: m.user.name, email: m.user.email },
    role: m.role as MemberRow['role'],
    invitedAt: m.invitedAt,
    acceptedAt: m.acceptedAt,
  }))

  const isOwner = callerMember.role === 'OWNER'

  return (
    <>
      <Header title="חברי צוות" />
      <div className="p-6 space-y-6">
        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle>הזמן חבר צוות</CardTitle>
            </CardHeader>
            <CardContent>
              <InviteMemberForm workspaceId={workspace.id} />
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>חברי הצוות ({memberRows.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberList members={memberRows} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
