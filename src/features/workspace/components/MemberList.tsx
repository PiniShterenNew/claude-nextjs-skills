import { Table } from '@/shared/components/ui/Table'
import { Badge } from '@/shared/components/ui/Badge'
import type { MemberRow } from '../types'

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'בעלים',
  MANAGER: 'מנהל',
  CHEF: 'שף',
  VIEWER: 'צופה',
}

interface MemberListProps {
  members: MemberRow[]
}

export function MemberList({ members }: MemberListProps) {
  return (
    <Table
      caption="רשימת חברי צוות"
      keyExtractor={(m) => m.id}
      data={members}
      columns={[
        { key: 'user', header: 'שם', render: (m) => (
          <div>
            <p className="font-medium text-foreground">{m.user.name}</p>
            <p className="text-xs text-muted-foreground">{m.user.email}</p>
          </div>
        )},
        { key: 'role', header: 'תפקיד', render: (m) => (
          <Badge variant={m.role === 'OWNER' ? 'info' : 'default'}>
            {ROLE_LABELS[m.role] ?? m.role}
          </Badge>
        )},
        { key: 'acceptedAt', header: 'הצטרף', render: (m) => (
          <span className="text-sm text-muted-foreground">
            {m.acceptedAt
              ? new Date(m.acceptedAt).toLocaleDateString('he-IL')
              : 'ממתין לאישור'}
          </span>
        )},
      ]}
      emptyState="אין חברי צוות"
    />
  )
}
