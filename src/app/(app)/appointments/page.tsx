import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { getAllAppointments } from '@/lib/data/appointments'
import { getPatients } from '@/lib/data/patients'
import { getDentists } from '@/lib/data/dentists'
import { AppointmentsView } from '@/components/appointments/appointments-view'

export default async function AppointmentsPage() {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  // Appointments span every clinic (dentists rotate between them), while
  // patients/dentists stay scoped to the active clinic — that's who this
  // clinic can book a new appointment against.
  const [appointments, patients, dentists] = await Promise.all([
    getAllAppointments(supabase),
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
