import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { token },
  })

  if (!invitation) {
    return NextResponse.json({ error: 'הזמנה לא נמצאה' }, { status: 404 })
  }

  if (invitation.expiresAt < new Date()) {
    return NextResponse.json({ error: 'הזמנה פגת תוקף' }, { status: 410 })
  }

  if (invitation.acceptedAt) {
    return NextResponse.redirect(new URL('/', _req.url))
  }

  const session = await auth()

  if (!session?.user?.id) {
    const signupUrl = new URL('/signup', _req.url)
    signupUrl.searchParams.set('invite', token)
    return NextResponse.redirect(signupUrl)
  }

  // Accept invitation
  const [workspace] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: invitation.workspaceId } }),
    prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: invitation.workspaceId,
          userId: session.user.id,
        },
      },
      create: {
        workspaceId: invitation.workspaceId,
        userId: session.user.id,
        role: invitation.role,
        acceptedAt: new Date(),
      },
      update: { acceptedAt: new Date() },
    }),
    prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    }),
  ])

  const slug = workspace?.slug ?? ''
  return NextResponse.redirect(new URL(`/${slug}/dashboard`, _req.url))
}
