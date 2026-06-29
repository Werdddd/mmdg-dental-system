'use client'

import { Bell, CalendarCheck, Menu } from 'lucide-react'
import Link from 'next/link'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PatientSearch } from '@/components/layout/patient-search'
import { cn } from '@/lib/utils'
import type {
  AppointmentRow,
  AppointmentStatus,
} from '@/components/appointments/data'
import type { UserRole } from '@/lib/auth/types'

// ── helpers ───────────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  dentist: 'Dentist',
}

const STATUS_DOT: Record<AppointmentStatus, string> = {
  Scheduled: 'bg-blue-500',
  'In Progress': 'bg-amber-500',
  Completed: 'bg-emerald-500',
  Cancelled: 'bg-destructive',
  'No Show': 'bg-slate-400',
  Rescheduled: 'bg-orange-400',
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function subtitle(role: UserRole, specialty: string | null): string {
  if (role === 'dentist') return specialty ?? 'Dentist'
  return ROLE_LABEL[role]
}

// ── component ─────────────────────────────────────────────────────────────────

interface TopNavbarProps {
  onMenuClick: () => void
  profileName?: string
  profileRole?: UserRole
  profileSpecialty?: string | null
  todayAppointments?: AppointmentRow[]
}

export function TopNavbar({
  onMenuClick,
  profileName = '',
  profileRole = 'dentist',
  profileSpecialty = null,
  todayAppointments = [],
}: TopNavbarProps) {
  const initials = profileName ? initialsOf(profileName) : '—'
  const displayName = profileName || 'User'
  const displaySubtitle = subtitle(profileRole, profileSpecialty)
  const notifCount = todayAppointments.length

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/95 px-4 backdrop-blur supports-backdrop-filter:bg-card/75 sm:px-6">
      {/* Hamburger — mobile only */}
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        className="-ml-1 flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {/* Search */}
      <PatientSearch />

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        {/* Notification bell */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Notifications — ${notifCount} today`}
            className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Bell className="size-5" />
            {notifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-80 p-0 shadow-lg"
            sideOffset={8}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Notifications</p>
                <p className="text-xs text-muted-foreground">
                  {notifCount === 0
                    ? 'No appointments today'
                    : `${notifCount} appointment${notifCount !== 1 ? 's' : ''} today`}
                </p>
              </div>
              {notifCount > 0 && <Badge variant="purple">{notifCount}</Badge>}
            </div>

            {/* List */}
            {todayAppointments.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <CalendarCheck className="size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  All clear — no appointments scheduled for today.
                </p>
              </div>
            ) : (
              <ul className="max-h-72 divide-y overflow-y-auto">
                {todayAppointments.map((appt) => (
                  <li
                    key={appt.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50"
                  >
                    <span
                      className={cn(
                        'mt-1.5 size-2 shrink-0 rounded-full',
                        STATUS_DOT[appt.status] ?? 'bg-primary',
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {appt.patient.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appt.time} · {appt.dentist.name}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {appt.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}

            {/* Footer link */}
            <div className="border-t p-2">
              <Link
                href="/appointments"
                className="block w-full rounded-md px-3 py-2 text-center text-sm font-medium text-primary hover:bg-muted"
              >
                View all appointments
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar + info */}
        <div className="ml-1 flex items-center gap-2.5 border-l pl-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{displaySubtitle}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
