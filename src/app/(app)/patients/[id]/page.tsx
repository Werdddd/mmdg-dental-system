import { notFound } from 'next/navigation'

import { getPatientById } from '@/components/patients/data'
import { PatientDetailsView } from '@/components/patients/details/patient-details-view'

export default async function PatientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const patient = getPatientById(id)

  if (!patient) {
    notFound()
  }

  return <PatientDetailsView patient={patient} />
}
