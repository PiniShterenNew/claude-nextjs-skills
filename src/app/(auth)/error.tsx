'use client'

import { useEffect } from 'react'
import { Button } from '@/shared/components/ui/Button'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AuthError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[AuthErrorBoundary]', {
      message: error.message,
      digest: error.digest,
    })
  }, [error])

  return (
    <div
      role="alert"
      className="flex min-h-[300px] flex-col items-center justify-center gap-6 text-center p-8"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-primary">אירעה שגיאה</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          אירעה שגיאה בלתי צפויה. אנא נסה שנית.
          {error.digest && (
            <span className="block mt-1 font-mono text-xs">
              קוד שגיאה: {error.digest}
            </span>
          )}
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} variant="primary">
          נסה שנית
        </Button>
        <Button onClick={() => { window.location.href = '/login' }} variant="secondary">
          חזור להתחברות
        </Button>
      </div>
    </div>
  )
}
