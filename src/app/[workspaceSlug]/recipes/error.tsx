'use client'

import { useEffect } from 'react'
import { Button } from '@/shared/components/ui/Button'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RecipesError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[RecipesErrorBoundary]', {
      message: error.message,
      digest: error.digest,
    })
  }, [error])

  return (
    <div
      role="alert"
      className="flex min-h-[400px] flex-col items-center justify-center gap-6 text-center p-8"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-primary">שגיאה בטעינת מתכון</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          לא ניתן לחשב את עלות המתכון — אנא רענן את הדף או פנה לתמיכה.
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
        <Button onClick={() => { window.location.href = window.location.pathname.replace(/\/recipes.*/, '/recipes') }} variant="secondary">
          חזור למתכונים
        </Button>
      </div>
    </div>
  )
}
