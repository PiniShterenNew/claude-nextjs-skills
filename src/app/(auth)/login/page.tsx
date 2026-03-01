import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card'
import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>כניסה ל-MenuCost</CardTitle>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <div className="mt-4 text-center text-sm text-muted-foreground space-y-1">
          <p>
            אין לך חשבון?{' '}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              הרשמה
            </Link>
          </p>
          <p>
            <Link href="/forgot-password" className="text-primary hover:underline">
              שכחת סיסמה?
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
