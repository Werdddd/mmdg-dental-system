'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  Stethoscope,
  Users,
  Wallet,
  X,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { signOut } from '@/app/login/actions'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Appointments', icon: CalendarDays, href: '/appointments' },
  { label: 'Patients', icon: Users, href: '/patients' },
  { label: 'Payments', icon: Wallet, href: '/payments' },
  { label: 'Invoices', icon: Receipt, href: '/invoices' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-30 bg-black/50 transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">MMDG Dental</p>
            <p className="text-xs text-muted-foreground">Doctor Portal</p>
          </div>

          {/* Close button — mobile only */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="ml-auto flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
            const active = href != null && pathname.startsWith(href)
            const itemClassName = cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )

            if (!href) {
              return (
                <div key={label} className={itemClassName}>
                  <Icon className="size-4" />
                  {label}
                </div>
              )
            }

            return (
              <Link
                key={label}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={itemClassName}
                onClick={onClose}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-3">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
