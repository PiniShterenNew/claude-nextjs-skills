'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/shared/lib/cn'
import { useWorkspaceStore } from '@/store/workspace-store'

interface NavItem {
  label: string
  href: string
  icon: string
}

interface SidebarProps {
  workspaceSlug: string
}

function buildNavItems(slug: string): NavItem[] {
  return [
    { label: 'סקירה כללית', href: `/${slug}/dashboard`, icon: 'dashboard' },
    { label: 'מתכונים', href: `/${slug}/recipes`, icon: 'restaurant_menu' },
    { label: 'חומרי גלם', href: `/${slug}/ingredients`, icon: 'inventory_2' },
    { label: 'ניהול תפריט', href: `/${slug}/menu-engineering`, icon: 'monitoring' },
  ]
}

const MANAGEMENT_ITEMS = (slug: string): NavItem[] => [
  { label: 'הגדרות', href: `/${slug}/settings`, icon: 'settings' },
  { label: 'חברי צוות', href: `/${slug}/settings/members`, icon: 'group' },
]

export function Sidebar({ workspaceSlug }: SidebarProps) {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useWorkspaceStore()

  const navItems = buildNavItems(workspaceSlug)
  const managementItems = MANAGEMENT_ITEMS(workspaceSlug)

  return (
    <aside
      className={cn(
        'fixed inset-y-0 end-0 z-30 flex flex-col bg-sidebar',
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
      aria-label="תפריט ניווט"
    >
      {/* Logo / Brand */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-hover">
        {!sidebarCollapsed && (
          <span className="text-lg font-bold text-white tracking-tight">
            Menu<span className="text-primary">Cost</span>
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-sidebar-foreground hover:bg-sidebar-hover transition-colors"
          aria-label={sidebarCollapsed ? 'הרחב סרגל' : 'כווץ סרגל'}
        >
          <span className={`material-symbols-outlined text-xl rtl:rotate-180 transition-transform`}>
            {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {!sidebarCollapsed && (
          <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
            ראשי
          </p>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname.startsWith(item.href)}
            collapsed={sidebarCollapsed}
          />
        ))}

        <div className="pt-4">
          {!sidebarCollapsed && (
            <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
              ניהול
            </p>
          )}
          {managementItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              collapsed={sidebarCollapsed}
            />
          ))}
        </div>
      </nav>
    </aside>
  )
}

function NavLink({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem
  isActive: boolean
  collapsed: boolean
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
        'transition-colors duration-150',
        isActive
          ? 'bg-primary text-white'
          : 'text-sidebar-foreground hover:bg-sidebar-hover',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? item.label : undefined}
    >
      <span className="material-symbols-outlined text-xl shrink-0">{item.icon}</span>
      {!collapsed && <span>{item.label}</span>}
    </Link>
  )
}
