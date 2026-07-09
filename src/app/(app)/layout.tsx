import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import { getCurrentProfile } from '@/lib/auth/profile'
import { createClient } from '@/lib/supabase/server'
import { getClinics, type ClinicRecord } from '@/lib/data/clinics'
import { getActiveClinicId } from '@/lib/data/clinic'
import {
  getTodayAppointments,
  getUpcomingReminders,
} from '@/lib/data/appointments'
import { MainLayout } from '@/components/layout/main-layout'
import type { AppointmentRow } from '@/components/appointments/data'

export default async function AppGroupLayout({
  children,
}: {
  children: ReactNode
}) {
  const profile = await getCurrentProfile()

  if (profile?.must_change_password) {
    redirect('/change-password')
  }

  const isSuperAdmin = profile?.role === 'superadmin'

  const supabase = await createClient()

  let clinics: ClinicRecord[] = []
  let activeClinicId: string | null = null
  let todayAppointments: AppointmentRow[] = []
  let reminderAppointments: AppointmentRow[] = []

  try {
    const clinicId = await getActiveClinicId()
    activeClinicId = clinicId

    if (isSuperAdmin) {
      ;[clinics, todayAppointments, reminderAppointments] = await Promise.all([
        getClinics(supabase),
        getTodayAppointments(supabase, clinicId),
        getUpcomingReminders(supabase, clinicId),
      ])
    } else {
      ;[todayAppointments, reminderAppointments] = await Promise.all([
        getTodayAppointments(supabase, clinicId),
        getUpcomingReminders(supabase, clinicId),
      ])
    }
  } catch {
    // No clinic yet — notifications stay empty
  }

  return (
    <MainLayout
      clinics={clinics}
      activeClinicId={activeClinicId}
      isSuperAdmin={isSuperAdmin}
      profileName={profile?.full_name ?? ''}
      profileRole={profile?.role ?? 'dentist'}
      profileSpecialty={
        (profile as { specialty?: string | null } | null)?.specialty ?? null
      }
      todayAppointments={todayAppointments}
      reminderAppointments={reminderAppointments}
    >
      {children}
    </MainLayout>
  )
}
