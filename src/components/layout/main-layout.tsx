'use client'

import { useState, type ReactNode } from 'react'

import { Sidebar } from '@/components/layout/sidebar'
import { TopNavbar } from '@/components/layout/top-navbar'
import { ClinicProvider } from '@/components/layout/clinic-context'
import type { ClinicRecord } from '@/lib/data/clinics'
import type { AppointmentRow } from '@/components/appointments/data'
import type { UserRole } from '@/lib/auth/types'

interface MainLayoutProps {
  children: ReactNode
  clinics?: ClinicRecord[]
  activeClinicId?: string | null
  isSuperAdmin?: boolean
  profileName?: string
  profileRole?: UserRole
  profileSpecialty?: string | null
  todayAppointments?: AppointmentRow[]
  reminderAppointments?: AppointmentRow[]
}

export function MainLayout({
  children,
  clinics = [],
  activeClinicId = null,
  isSuperAdmin = false,
  profileName = '',
  profileRole = 'dentist',
  profileSpecialty = null,
  todayAppointments = [],
  reminderAppointments = [],
}: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <ClinicProvider value={{ clinics, activeClinicId, isSuperAdmin }}>
      <div className="min-h-svh bg-muted/30">
        <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="flex min-h-svh flex-col lg:pl-64">
          <TopNavbar
            onMenuClick={() => setMobileOpen(true)}
            profileName={profileName}
            profileRole={profileRole}
            profileSpecialty={profileSpecialty}
            todayAppointments={todayAppointments}
            reminderAppointments={reminderAppointments}
          />

          <main className="flex-1 space-y-6 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </ClinicProvider>
  )
}
