import type { LucideIcon } from 'lucide-react'
import {
  CalendarPlus,
  ClipboardList,
  MessageSquarePlus,
  UserPlus,
} from 'lucide-react'

interface QuickAction {
  icon: LucideIcon
  label: string
}

const ACTIONS: QuickAction[] = [
  { icon: CalendarPlus, label: 'New Appointment' },
  { icon: UserPlus, label: 'Add Patient' },
  { icon: ClipboardList, label: 'View Records' },
  { icon: MessageSquarePlus, label: 'Send Message' },
]

export function QuickActionsCard() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold">Quick Actions</h2>
      <p className="text-sm text-muted-foreground">Common daily tasks</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {ACTIONS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 text-center transition-colors hover:bg-muted"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
