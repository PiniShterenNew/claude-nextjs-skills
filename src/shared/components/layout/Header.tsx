import { auth } from '@/shared/lib/auth'

interface HeaderProps {
  title?: string
}

export async function Header({ title }: HeaderProps) {
  const session = await auth()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      {title && (
        <h1 className="text-2xl font-bold text-foreground-secondary">{title}</h1>
      )}
      <div className="flex items-center gap-3 ms-auto">
        <button
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
          aria-label="התראות"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>

        {session?.user && (
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 flex items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
              {session.user.name?.[0]?.toUpperCase() ?? '?'}
            </span>
            <span className="text-sm font-medium text-foreground hidden md:block">
              {session.user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
