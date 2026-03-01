import Link from 'next/link'

export default function GlobalNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center p-8">
      <div className="space-y-2">
        <h1 className="text-5xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-primary">הדף לא נמצא</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          הדף שחיפשת אינו קיים או הועבר למיקום אחר.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors"
      >
        חזור לדף הבית
      </Link>
    </div>
  )
}
