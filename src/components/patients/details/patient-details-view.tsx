'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PatientRow } from '@/components/patients/data'
import type { PatientAppointmentData } from '@/lib/data/appointments'
import type { PatientNoteEntry } from '@/lib/data/patient-notes'
import {
  getDentalChart,
  getPatientProfile,
  getPaymentHistory,
  appointmentsToDentalHistory,
} from '@/components/patients/details/data'
import { PatientHeaderCard } from '@/components/patients/details/patient-header-card'
import { PatientAboutCard } from '@/components/patients/details/patient-about-card'
import { ChiefComplaintCard } from '@/components/patients/details/chief-complaint-card'
import { PatientNotesCard } from '@/components/patients/details/patient-notes-card'
import { MedicalRecordsTabs } from '@/components/patients/details/medical-records-tabs'

interface PatientDetailsViewProps {
  patient: PatientRow
  appointments?: PatientAppointmentData[]
  notes?: PatientNoteEntry[]
}

export function PatientDetailsView({
  patient,
  appointments,
  notes = [],
}: PatientDetailsViewProps) {
  const profile = getPatientProfile(patient)
  const dentalHistory =
    appointments && appointments.length > 0
      ? appointmentsToDentalHistory(patient.id, appointments)
      : []
  const dentalChart = getDentalChart(patient)
  const paymentHistory = getPaymentHistory(patient)

  return (
    <>
      <Link
        href="/patients"
        className={cn(buttonVariants({ variant: 'ghost' }), 'gap-1.5 px-2')}
      >
        <ArrowLeft className="size-4" />
        Back to Patients
      </Link>

      <PatientHeaderCard patient={patient} profile={profile} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PatientAboutCard about={profile.about} />
        <ChiefComplaintCard complaint={profile.chiefComplaint} />
        <PatientNotesCard patientId={patient.id} notes={notes} />
      </div>

      <MedicalRecordsTabs
        dentalHistory={dentalHistory}
        dentalChart={dentalChart}
        paymentHistory={paymentHistory}
      />
    </>
  )
}
