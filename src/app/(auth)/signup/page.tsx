import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card'
import { SignupForm } from '@/features/auth/components/SignupForm'

interface SignupPageProps {
  searchParams: Promise<{ invite?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { invite } = await searchParams

  return (
    <Card>
      <CardHeader>
        <CardTitle>הרשמה ל-MenuCost</CardTitle>
      </CardHeader>
      <CardContent>
        <SignupForm inviteToken={invite} />
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>
            יש לך חשבון?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              כניסה
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
