import { notFound, redirect } from 'next/navigation'

import { getCurrentProfile } from '@/lib/auth/profile'
import { createClient } from '@/lib/supabase/server'
import { getClinicById } from '@/lib/data/clinics'
import { getStaffUsers } from '@/lib/data/staff'
import { getPayments } from '@/lib/data/payments'
import { getPatientCount } from '@/lib/data/patients'
import { getAppointmentCount } from '@/lib/data/appointments'
import { ClinicDetailsView } from '@/components/clinics/clinic-details-view'

export default async function ClinicDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const profile = await getCurrentProfile()
  if (profile?.role !== 'superadmin') redirect('/dashboard')

  const { id } = await params
  const supabase = await createClient()

  const [clinic, staff, payments, patientCount, appointmentCount] =
    await Promise.all([
      getClinicById(supabase, id),
      getStaffUsers(supabase, id),
      getPayments(supabase, id),
      getPatientCount(supabase, id),
      getAppointmentCount(supabase, id),
    ])

  if (!clinic) {
    notFound()
  }

  return (
    <ClinicDetailsView
      clinic={clinic}
      staff={staff}
      payments={payments}
      patientCount={patientCount}
      appointmentCount={appointmentCount}
      currentUserId={profile.id}
    />
  )
}
