'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useClinicContext } from '@/components/layout/clinic-context'
import type { PatientRow } from '@/components/patients/data'
import type { PatientNoteEntry } from '@/lib/data/patient-notes'
import type { ToothRecord } from '@/lib/data/dental-chart'
import type { ToothPhoto } from '@/lib/data/dental-chart-photos'
import type { ClinicBranch } from '@/lib/dental/branches'
import type { DentistOption } from '@/lib/data/dentists'
import type { TreatmentRecordRow } from '@/lib/data/treatment-records'
import type { PaymentRow } from '@/components/payments/data'
import type { PatientMedicalHistoryRow } from '@/lib/data/patient-medical-history'
import type { PatientConsentFormRow } from '@/lib/data/patient-consent-forms'
import type { PatientRadiographConsentRow } from '@/lib/data/patient-radiograph-consents'
import type { PatientDocumentRow } from '@/lib/data/patient-documents'
import { getPatientProfile } from '@/components/patients/details/data'
import { PatientHeaderCard } from '@/components/patients/details/patient-header-card'
import { PatientAboutCard } from '@/components/patients/details/patient-about-card'
import { DentalVisitCard } from '@/components/patients/details/dental-visit-card'
import { PatientNotesCard } from '@/components/patients/details/patient-notes-card'
import { MedicalHistoryCard } from '@/components/patients/details/medical-history-card'
import { ConsentFormCard } from '@/components/patients/details/consent-form-card'
import { RadiographConsentCard } from '@/components/patients/details/radiograph-consent-card'
import { SystemMetadataCard } from '@/components/patients/details/system-metadata-card'
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
  documents: PatientDocumentRow[]
  medicalHistory: PatientMedicalHistoryRow | null
  consentForm: PatientConsentFormRow | null
  radiographConsent: PatientRadiographConsentRow | null
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
  documents,
  medicalHistory,
  consentForm,
  radiographConsent,
}: PatientDetailsViewProps) {
  const profile = getPatientProfile(patient)
  const { clinics, isSuperAdmin } = useClinicContext()
  // A patient outside every clinic this staff member belongs to gets a
  // read-only chart — only Log Treatment stays writable for them. SuperAdmin
  // is never treated as "foreign" since their RLS access isn't clinic-scoped.
  const isForeignPatient =
    !isSuperAdmin && !clinics.some((c) => c.id === patient.clinicId)

  return (
    <>
      <Link
        href="/patients"
        className={cn(buttonVariants({ variant: 'ghost' }), 'gap-1.5 px-2')}
      >
        <ArrowLeft className="size-4" />
        Back to Patients
      </Link>

      <PatientHeaderCard
        patient={patient}
        profile={profile}
        documents={documents}
        readOnly={isForeignPatient}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PatientAboutCard about={profile.about} />
        <DentalVisitCard visit={profile.dentalVisit} />
        <PatientNotesCard
          patientId={patient.id}
          notes={notes}
          readOnly={isForeignPatient}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <MedicalHistoryCard
          medicalHistory={medicalHistory}
          isFemale={patient.gender === 'Female'}
        />
        <ConsentFormCard consentForm={consentForm} patientName={patient.name} />
        <RadiographConsentCard
          patientId={patient.id}
          patientName={patient.name}
          patientAddress={patient.address}
          radiographConsent={radiographConsent}
        />
        <SystemMetadataCard metadata={profile.systemMetadata} />
      </div>

      <MedicalRecordsTabs
        patientId={patient.id}
        treatmentRecords={treatmentRecords}
        dentalChart={dentalChart}
        branches={branches}
        photos={photos}
        dentists={dentists}
        payments={payments}
        readOnlyChart={isForeignPatient}
      />
    </>
  )
}
