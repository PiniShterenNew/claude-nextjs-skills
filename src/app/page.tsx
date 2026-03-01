import { redirect } from 'next/navigation'
import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'

export default async function RootPage() {
  const session = await auth()

  if (!session?.user?.id) redirect('/login')

  // Find user's first workspace
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: { select: { slug: true } } },
    orderBy: { invitedAt: 'asc' },
  })

  if (!membership) redirect('/onboarding')

  redirect(`/${membership.workspace.slug}/dashboard`)
}
