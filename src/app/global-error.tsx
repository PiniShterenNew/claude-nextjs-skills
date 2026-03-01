'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', {
      message: error.message,
      digest: error.digest,
    })
  }, [error])

  return (
    <html lang="he" dir="rtl">
      <body>
        <div
          role="alert"
          style={{
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>שגיאת מערכת</h1>
          <p style={{ color: '#666', maxWidth: '400px', fontSize: '0.875rem' }}>
            האפליקציה נתקלה בשגיאה קריטית. אנא רענן את הדף.
          </p>
          {error.digest && (
            <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#999' }}>
              קוד שגיאה: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            רענן
          </button>
        </div>
      </body>
    </html>
  )
}
