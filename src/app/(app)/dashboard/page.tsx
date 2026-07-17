import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { getAppointments, getAllAppointments } from '@/lib/data/appointments'
import { getPatients } from '@/lib/data/patients'
import { getDentists } from '@/lib/data/dentists'
import { getInvoicesWithBalance } from '@/lib/data/invoices'
import { getPendingTreatmentRecords } from '@/lib/data/treatment-records'
import { getCurrentProfile } from '@/lib/auth/profile'
import { DashboardView } from '@/components/dashboard/dashboard-view'

export default async function DashboardPage() {
  const [profile, clinicId] = await Promise.all([
    getCurrentProfile(),
    getActiveClinicId(),
  ])

  const supabase = await createClient()
  const [
    appointments,
    allAppointments,
    patients,
    dentists,
    invoicesWithBalance,
    pendingTreatments,
  ] = await Promise.all([
    getAppointments(supabase, clinicId),
    // Cross-clinic, for the mini calendar — dentists rotate between
    // clinics, so staff need to see every clinic's bookings there to spot
    // conflicts. The stat cards above stay scoped to the active clinic.
    getAllAppointments(supabase),
    getPatients(supabase, clinicId),
    getDentists(supabase, clinicId),
    getInvoicesWithBalance(supabase, clinicId),
    getPendingTreatmentRecords(supabase, clinicId),
  ])

  return (
    <DashboardView
      key={clinicId}
      appointments={appointments}
      allAppointments={allAppointments}
      patients={patients}
      dentists={dentists}
      invoicesWithBalance={invoicesWithBalance}
      pendingTreatments={pendingTreatments}
      profileName={profile?.full_name ?? 'Doctor'}
    />
  )
}
