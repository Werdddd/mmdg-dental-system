import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { getAppointments } from '@/lib/data/appointments'
import { getPatients } from '@/lib/data/patients'
import { getDentists } from '@/lib/data/dentists'
import { AppointmentsView } from '@/components/appointments/appointments-view'

export default async function AppointmentsPage() {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const [appointments, patients, dentists] = await Promise.all([
    getAppointments(supabase, clinicId),
    getPatients(supabase, clinicId),
    getDentists(supabase, clinicId),
  ])

  return (
    <AppointmentsView
      key={clinicId}
      initialAppointments={appointments}
      patients={patients}
      dentists={dentists}
    />
  )
}
