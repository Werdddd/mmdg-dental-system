import type { LucideIcon } from 'lucide-react'
import { CalendarCheck, ClipboardEdit, FileText, UserPlus } from 'lucide-react'

interface ActivityItem {
  icon: LucideIcon
  text: string
  meta: string
  time: string
}

const ACTIVITY: ActivityItem[] = [
  {
    icon: CalendarCheck,
    text: 'Appointment confirmed for Maria Santos',
    meta: 'Routine Cleaning',
    time: '5 min ago',
  },
  {
    icon: UserPlus,
    text: 'New patient registered — Noah Bautista',
    meta: 'Added by front desk',
    time: '32 min ago',
  },
  {
    icon: FileText,
    text: 'Lab results uploaded for James Cruz',
    meta: 'Root Canal Follow-up',
    time: '1 hr ago',
  },
  {
    icon: ClipboardEdit,
    text: 'Treatment plan updated for Liza Fernandez',
    meta: 'Tooth Extraction',
    time: '3 hrs ago',
  },
]

export function RecentActivityCard() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold">Recent Activity</h2>
      <p className="text-sm text-muted-foreground">
        Latest updates across your clinic
      </p>

      <ul className="mt-5 space-y-5">
        {ACTIVITY.map((item, idx) => (
          <li key={idx} className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <item.icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{item.text}</p>
              <p className="text-xs text-muted-foreground">
                {item.meta} · {item.time}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
