import { redirect } from 'next/navigation'
import { auth } from '@/shared/lib/auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card'
import { WorkspaceCreateForm } from '@/features/workspace/components/WorkspaceCreateForm'

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground-secondary">ברוך הבא ל-MenuCost</h1>
          <p className="text-muted-foreground mt-2">צור את סביבת העבודה הראשונה שלך</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>סביבת עבודה חדשה</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkspaceCreateForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
