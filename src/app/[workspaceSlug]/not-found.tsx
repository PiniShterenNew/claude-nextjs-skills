import Link from 'next/link'

export default function WorkspaceNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center p-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-primary">404</h1>
        <h2 className="text-xl font-semibold text-primary">הדף לא נמצא</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          הדף שחיפשת אינו קיים, או שאין לך הרשאת גישה אליו.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors"
        >
          עבור ללוח הבקרה
        </Link>
        <Link
          href="/login"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground shadow-sm hover:bg-surface-subtle transition-colors"
        >
          התחברות
        </Link>
      </div>
    </div>
  )
}
