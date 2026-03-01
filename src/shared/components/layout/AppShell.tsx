import { Sidebar } from './Sidebar'

interface AppShellProps {
  workspaceSlug: string
  children: React.ReactNode
}

export function AppShell({ workspaceSlug, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar — fixed on the right (RTL) */}
      <Sidebar workspaceSlug={workspaceSlug} />

      {/* Main content — offset by sidebar width */}
      <div className="pe-64 transition-all duration-300">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}
