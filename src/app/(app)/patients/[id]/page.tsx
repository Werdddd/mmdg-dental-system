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
import { getPatientDocuments } from '@/lib/data/patient-documents'
import { PatientDetailsView } from '@/components/patients/details/patient-details-view'

export default async function PatientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const clinicId = await getActiveClinicId()

  const patient = await getPatientById(supabase, id)
  if (!patient) {
    notFound()
  }

  // The patient's own chart (notes, dental chart, branches, photos) belongs
  // to their home clinic, not the viewer's active clinic — a visiting staff
  // member sees the same chart their home clinic sees. Dentist list and
  // payment/invoice history stay scoped to the ACTING (viewer's) clinic:
  // the dentist picker should offer whoever can actually treat here, and
  // billing must never cross clinics.
  const [
    notes,
    dentalChart,
    branches,
    photos,
    documents,
    dentists,
    treatmentRecords,
    payments,
    intakeExtras,
  ] = await Promise.all([
    getPatientNotes(supabase, patient.clinicId, id),
    getToothRecords(supabase, patient.clinicId, id),
    getPatientBranches(supabase, patient.clinicId, id),
    getToothPhotos(supabase, patient.clinicId, id),
    getPatientDocuments(supabase, patient.clinicId, id),
    getDentists(supabase, clinicId),
    getTreatmentRecordsForPatient(supabase, id),
    getPaymentsForPatient(supabase, clinicId, id),
    getPatientIntakeExtras(supabase, id),
  ])

  return (
    <PatientDetailsView
      patient={patient}
      notes={notes}
      dentalChart={dentalChart}
      branches={branches}
      photos={photos}
      documents={documents}
      dentists={dentists}
      treatmentRecords={treatmentRecords}
      payments={payments}
      medicalHistory={intakeExtras.medicalHistory}
      consentForm={intakeExtras.consentForm}
      radiographConsent={intakeExtras.radiographConsent}
    />
  )
}
