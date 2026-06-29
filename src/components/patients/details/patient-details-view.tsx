'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PatientRow } from '@/components/patients/data'
import type { PatientNoteEntry } from '@/lib/data/patient-notes'
import type { ToothRecord } from '@/lib/data/dental-chart'
import type { ToothPhoto } from '@/lib/data/dental-chart-photos'
import type { ClinicBranch } from '@/lib/dental/branches'
import type { DentistOption } from '@/lib/data/dentists'
import type { TreatmentRecordRow } from '@/lib/data/treatment-records'
import type { PaymentRow } from '@/components/payments/data'
import type { SponsorRow } from '@/lib/data/sponsors'
import { getPatientProfile } from '@/components/patients/details/data'
import { PatientHeaderCard } from '@/components/patients/details/patient-header-card'
import { PatientAboutCard } from '@/components/patients/details/patient-about-card'
import { ChiefComplaintCard } from '@/components/patients/details/chief-complaint-card'
import { PatientNotesCard } from '@/components/patients/details/patient-notes-card'
import { MedicalRecordsTabs } from '@/components/patients/details/medical-records-tabs'

interface PatientDetailsViewProps {
  patient: PatientRow
  notes?: PatientNoteEntry[]
  dentalChart: ToothRecord[]
  branches: ClinicBranch[]
  photos: ToothPhoto[]
  dentists: DentistOption[]
  treatmentRecords: TreatmentRecordRow[]
  payments: PaymentRow[]
  sponsors: SponsorRow[]
}

export function PatientDetailsView({
  patient,
  notes = [],
  dentalChart,
  branches,
  photos,
  dentists,
  treatmentRecords,
  payments,
  sponsors,
}: PatientDetailsViewProps) {
  const profile = getPatientProfile(patient)

  return (
    <>
      <Link
        href="/patients"
        className={cn(buttonVariants({ variant: 'ghost' }), 'gap-1.5 px-2')}
      >
        <ArrowLeft className="size-4" />
        Back to Patients
      </Link>

      <PatientHeaderCard patient={patient} profile={profile} sponsors={sponsors} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PatientAboutCard about={profile.about} />
        <ChiefComplaintCard complaint={profile.chiefComplaint} />
        <PatientNotesCard patientId={patient.id} notes={notes} />
      </div>

      <MedicalRecordsTabs
        patientId={patient.id}
        treatmentRecords={treatmentRecords}
        dentalChart={dentalChart}
        branches={branches}
        photos={photos}
        dentists={dentists}
        payments={payments}
      />
    </>
  )
}
