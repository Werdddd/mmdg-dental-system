'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PatientRow, SystemMetadata } from '@/components/patients/data'
import {
  addPatientAction,
  updatePatientAction,
} from '@/app/(app)/patients/actions'
import { PatientInfoSection } from '@/components/patients/intake/patient-info-section'
import { DentalVisitSection } from '@/components/patients/intake/dental-visit-section'
import { MedicalHistorySection } from '@/components/patients/intake/medical-history-section'
import { ConsentSection } from '@/components/patients/intake/consent-section'
import { SystemMetadataSection } from '@/components/patients/intake/system-metadata-section'
import {
  EMPTY_PATIENT_INTAKE_FORM_VALUES,
  intakeFormValuesToInput,
  isConsentTabComplete,
  isDentalVisitTabComplete,
  isMedicalHistoryTabComplete,
  isPatientInfoTabComplete,
  type PatientIntakeFormValues,
} from '@/components/patients/intake/types'

interface PatientIntakeFormProps {
  mode: 'create' | 'edit'
  patientId?: string
  initialValues?: PatientIntakeFormValues
  initialPhotoUrl?: string
  readOnlyMetadata?: SystemMetadata
}

const TABS = [
  {
    value: 'patient-info',
    label: 'Patient Information',
    isComplete: isPatientInfoTabComplete,
  },
  {
    value: 'dental-visit',
    label: 'Dental Visit Information',
    isComplete: isDentalVisitTabComplete,
  },
  {
    value: 'medical-history',
    label: 'Medical History',
    isComplete: isMedicalHistoryTabComplete,
  },
  {
    value: 'consent',
    label: 'Consent & Waiver',
    isComplete: isConsentTabComplete,
  },
] as const

// How far into the wizard the patient can go: every tab up to and
// including the first incomplete one is reachable, everything after it is
// locked until the ones before it are filled in.
function maxUnlockedTabIndex(values: PatientIntakeFormValues) {
  let index = 0
  while (index < TABS.length - 1 && TABS[index].isComplete(values)) {
    index++
  }
  return index
}

export function PatientIntakeForm({
  mode,
  patientId,
  initialValues,
  initialPhotoUrl,
  readOnlyMetadata,
}: PatientIntakeFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<PatientIntakeFormValues>(
    initialValues ?? EMPTY_PATIENT_INTAKE_FORM_VALUES,
  )
  const [activeTab, setActiveTab] = useState<string>(TABS[0].value)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onChange(patch: Partial<PatientIntakeFormValues>) {
    setValues((prev) => ({ ...prev, ...patch }))
  }

  // Edit mode starts from an already-complete (or legacy, pre-this-feature)
  // record, so the guided wizard gating only applies to creating a new
  // patient — editing keeps every tab freely reachable.
  const unlockedIndex =
    mode === 'create' ? maxUnlockedTabIndex(values) : TABS.length - 1
  const activeIndex = TABS.findIndex((tab) => tab.value === activeTab)

  function goToTab(index: number) {
    if (index < 0 || index >= TABS.length) return
    if (mode === 'create' && index > unlockedIndex) return
    setActiveTab(TABS[index].value)
  }

  const canSubmit =
    isPatientInfoTabComplete(values) &&
    (mode === 'edit' || isConsentTabComplete(values)) &&
    !isSubmitting

  async function handleSubmit() {
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)
    try {
      const input = intakeFormValuesToInput(values)
      let patient: PatientRow
      if (mode === 'create') {
        patient = await addPatientAction(input, values.photoFile)
      } else {
        if (!patientId) throw new Error('Missing patient id')
        patient = await updatePatientAction(
          patientId,
          input,
          values.photoFile,
          values.photoRemoved,
        )
      }
      router.push(`/patients/${patient.id}`)
      router.refresh()
    } catch {
      setError(
        mode === 'create'
          ? 'Could not add patient. Please try again.'
          : 'Could not save changes. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCancel() {
    if (mode === 'edit' && patientId) {
      router.push(`/patients/${patientId}`)
    } else {
      router.push('/patients')
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            const index = TABS.findIndex((tab) => tab.value === value)
            goToTab(index)
          }}
        >
          <TabsList>
            {TABS.map((tab, index) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={mode === 'create' && index > unlockedIndex}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="patient-info">
            <PatientInfoSection
              values={values}
              onChange={onChange}
              existingPhotoUrl={initialPhotoUrl}
            />
          </TabsContent>
          <TabsContent value="dental-visit">
            <DentalVisitSection values={values} onChange={onChange} />
          </TabsContent>
          <TabsContent value="medical-history">
            <MedicalHistorySection values={values} onChange={onChange} />
          </TabsContent>
          <TabsContent value="consent">
            <ConsentSection values={values} onChange={onChange} />
          </TabsContent>
        </Tabs>

        {mode === 'create' && activeIndex < TABS.length - 1 && (
          <div className="mt-6 flex justify-end border-t pt-4">
            <Button
              onClick={() => goToTab(activeIndex + 1)}
              disabled={!TABS[activeIndex]?.isComplete(values)}
              className="gap-1.5"
            >
              Continue to {TABS[activeIndex + 1]?.label}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {mode === 'edit' && (
        <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-base font-semibold">Record Status</h2>
          <SystemMetadataSection
            values={values}
            onChange={onChange}
            readOnlyMetadata={readOnlyMetadata}
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {isSubmitting
            ? mode === 'create'
              ? 'Adding…'
              : 'Saving…'
            : mode === 'create'
              ? 'Add Patient'
              : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
