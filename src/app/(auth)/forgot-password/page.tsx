import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>שחזור סיסמה</CardTitle>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            חזרה לכניסה
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
