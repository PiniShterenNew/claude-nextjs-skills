import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card'
import { verifyEmail } from '@/features/auth/actions/verify-email'

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams

  if (!token) {
    return (
      <Card>
        <CardHeader><CardTitle>אימות אימייל</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-4 space-y-2">
            <p className="text-muted-foreground">
              בדוק את תיבת האימייל שלך ולחץ על הקישור שנשלח אליך.
            </p>
            <Link href="/login" className="text-primary hover:underline text-sm">חזרה לכניסה</Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const result = await verifyEmail(token)

  return (
    <Card>
      <CardHeader><CardTitle>אימות אימייל</CardTitle></CardHeader>
      <CardContent>
        {result.success ? (
          <div className="text-center py-4 space-y-3">
            <span className="material-symbols-outlined text-5xl text-success">verified</span>
            <p className="font-medium text-foreground">האימייל אומת בהצלחה!</p>
            <Link
              href="/login"
              className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover"
            >
              המשך לכניסה
            </Link>
          </div>
        ) : (
          <div className="text-center py-4 space-y-2">
            <span className="material-symbols-outlined text-5xl text-destructive">error</span>
            <p className="text-destructive font-medium">{result.error}</p>
            <Link href="/login" className="text-primary hover:underline text-sm">חזרה לכניסה</Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
