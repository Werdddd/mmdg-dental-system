import type { ReactNode } from 'react'

import { getCurrentProfile } from '@/lib/auth/profile'
import { createClient } from '@/lib/supabase/server'
import { getClinics, type ClinicRecord } from '@/lib/data/clinics'
import { getActiveClinicId } from '@/lib/data/clinic'
import { getTodayAppointments } from '@/lib/data/appointments'
import { MainLayout } from '@/components/layout/main-layout'
import type { AppointmentRow } from '@/components/appointments/data'

export default async function AppGroupLayout({
  children,
}: {
  children: ReactNode
}) {
  const profile = await getCurrentProfile()
  const isSuperAdmin = profile?.role === 'superadmin'

  const supabase = await createClient()

  let clinics: ClinicRecord[] = []
  let activeClinicId: string | null = null
  let todayAppointments: AppointmentRow[] = []

  try {
    const clinicId = await getActiveClinicId()

    if (isSuperAdmin) {
      ;[clinics, todayAppointments] = await Promise.all([
        getClinics(supabase),
        getTodayAppointments(supabase, clinicId),
      ])
      activeClinicId = clinicId
    } else {
      todayAppointments = await getTodayAppointments(supabase, clinicId)
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
    >
      {children}
    </MainLayout>
  )
}
