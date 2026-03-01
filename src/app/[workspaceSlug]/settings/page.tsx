import { redirect } from 'next/navigation'
import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { Header } from '@/shared/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ workspaceSlug: string }>
}

export default async function SettingsRoute({ params }: PageProps) {
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
      <Header title="הגדרות" />
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>פרטי סביבת עבודה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">שם</span>
                <span className="font-medium">{workspace.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slug</span>
                <span className="font-mono text-xs bg-surface-subtle px-2 py-0.5 rounded">{workspace.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">סף Food Cost</span>
                <span className="font-medium">{workspace.foodCostThreshold.toString()}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">התפקיד שלי</span>
                <span className="font-medium">{member.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
