import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Stethoscope,
  Users,
} from 'lucide-react'

import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Appointments', icon: CalendarDays, active: false },
  { label: 'Patients', icon: Users, active: false },
  { label: 'Records', icon: ClipboardList, active: false },
  { label: 'Messages', icon: MessageSquare, active: false },
  { label: 'Settings', icon: Settings, active: false },
]

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-card lg:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Stethoscope className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">MMDG Dental</p>
          <p className="text-xs text-muted-foreground">Doctor Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
          <div
            key={label}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            {label}
          </div>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
          <LogOut className="size-4" />
          Logout
        </div>
      </div>
    </aside>
  )
}
