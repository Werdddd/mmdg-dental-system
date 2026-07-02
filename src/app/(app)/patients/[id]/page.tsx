import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { getPatientById, getPatientIntakeExtras } from '@/lib/data/patients'
import { getPatientNotes } from '@/lib/data/patient-notes'
import { getToothRecords } from '@/lib/data/dental-chart'
import { getPatientBranches } from '@/lib/data/patient-branches'
import { getToothPhotos } from '@/lib/data/dental-chart-photos'
import { getDentists } from '@/lib/data/dentists'
import { getTreatmentRecordsForPatient } from '@/lib/data/treatment-records'
import { getPaymentsForPatient } from '@/lib/data/payments'
import { PatientDetailsView } from '@/components/patients/details/patient-details-view'

export default async function PatientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const clinicId = await getActiveClinicId()

  const [
    patient,
    notes,
    dentalChart,
    branches,
    photos,
    dentists,
    treatmentRecords,
    payments,
    intakeExtras,
  ] = await Promise.all([
    getPatientById(supabase, clinicId, id),
    getPatientNotes(supabase, clinicId, id),
    getToothRecords(supabase, clinicId, id),
    getPatientBranches(supabase, clinicId, id),
    getToothPhotos(supabase, clinicId, id),
    getDentists(supabase, clinicId),
    getTreatmentRecordsForPatient(supabase, clinicId, id),
    getPaymentsForPatient(supabase, clinicId, id),
    getPatientIntakeExtras(supabase, id),
  ])

  if (!patient) {
    notFound()
  }

  return (
    <PatientDetailsView
      patient={patient}
      notes={notes}
      dentalChart={dentalChart}
      branches={branches}
      photos={photos}
      dentists={dentists}
      treatmentRecords={treatmentRecords}
      payments={payments}
      medicalHistory={intakeExtras.medicalHistory}
      consentForm={intakeExtras.consentForm}
    />
  )
}
