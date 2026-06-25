import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { getPatientById } from '@/lib/data/patients'
import { getPatientAppointments } from '@/lib/data/appointments'
import { PatientDetailsView } from '@/components/patients/details/patient-details-view'

export default async function PatientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const clinicId = await getActiveClinicId()

  const [patient, appointments] = await Promise.all([
    getPatientById(supabase, clinicId, id),
    getPatientAppointments(supabase, clinicId, id),
  ])

  if (!patient) {
    notFound()
  }

  return <PatientDetailsView patient={patient} appointments={appointments} />
}
