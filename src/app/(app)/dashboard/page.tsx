import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { getAppointments } from '@/lib/data/appointments'
import { getPatients } from '@/lib/data/patients'
import { getDentists } from '@/lib/data/dentists'
import { getInvoicesWithBalance } from '@/lib/data/invoices'
import { getPendingTreatmentRecords } from '@/lib/data/treatment-records'
import { getSponsors } from '@/lib/data/sponsors'
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
    patients,
    dentists,
    invoicesWithBalance,
    pendingTreatments,
    sponsors,
  ] = await Promise.all([
    getAppointments(supabase, clinicId),
    getPatients(supabase, clinicId),
    getDentists(supabase, clinicId),
    getInvoicesWithBalance(supabase, clinicId),
    getPendingTreatmentRecords(supabase, clinicId),
    getSponsors(supabase, clinicId),
  ])

  return (
    <DashboardView
      key={clinicId}
      appointments={appointments}
      patients={patients}
      dentists={dentists}
      invoicesWithBalance={invoicesWithBalance}
      pendingTreatments={pendingTreatments}
      sponsors={sponsors}
      profileName={profile?.full_name ?? 'Doctor'}
    />
  )
}
