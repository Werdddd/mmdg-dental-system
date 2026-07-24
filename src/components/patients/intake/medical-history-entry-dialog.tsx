'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MedicalHistorySection } from '@/components/patients/intake/medical-history-section'
import type { MedicalHistorySectionValues } from '@/components/patients/intake/types'
import { submitPatientMedicalHistoryAction } from '@/app/(app)/patients/actions'
import type { PatientMedicalHistoryEntry } from '@/lib/data/patient-medical-history'
import type { PatientRow } from '@/components/patients/data'

interface MedicalHistoryEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  firstName: string
  lastName: string
  gender: PatientRow['gender']
  onSaved?: (entry: PatientMedicalHistoryEntry) => void
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function blankValues(
  firstName: string,
  lastName: string,
  gender: PatientRow['gender'],
): MedicalHistorySectionValues {
  return {
    gender,
    firstName,
    lastName,
    generalResponses: {},
    additionalResponses: {},
    womenOnlyResponses: {},
    conditions: {},
    medicalHistorySignature: null,
    medicalHistorySignedAt: today(),
  }
}

export function MedicalHistoryEntryDialog({
  open,
  onOpenChange,
  patientId,
  firstName,
  lastName,
  gender,
  onSaved,
}: MedicalHistoryEntryDialogProps) {
  const [values, setValues] = useState<MedicalHistorySectionValues>(() =>
    blankValues(firstName, lastName, gender),
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wasOpen, setWasOpen] = useState(open)

  // Every time this dialog opens it starts a fresh filing — unlike editing
  // a record in place, re-seeding on open (rather than pre-filling from the
  // previous entry) is adjusted during render to avoid an extra pass; see
  // https://react.dev/learn/you-might-not-need-an-effect.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setValues(blankValues(firstName, lastName, gender))
      setError(null)
    }
  }

  function patch(update: Partial<MedicalHistorySectionValues>) {
    setValues((prev) => ({ ...prev, ...update }))
  }

  const canSave =
    values.medicalHistorySignature !== null &&
    values.medicalHistorySignedAt.length > 0 &&
    !isSaving

  async function handleSave() {
    if (!canSave) return
    setIsSaving(true)
    setError(null)
    try {
      const entry = await submitPatientMedicalHistoryAction(patientId, {
        generalResponses: values.generalResponses,
        additionalResponses: values.additionalResponses,
        womenOnlyResponses: values.womenOnlyResponses,
        conditions: values.conditions,
        patientSignature: values.medicalHistorySignature,
        signedAt: values.medicalHistorySignedAt,
      })
      onSaved?.(entry)
      onOpenChange(false)
    } catch {
      setError('Could not save this questionnaire. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Medical History Questionnaire</DialogTitle>
          <DialogDescription>
            Files a new questionnaire for this patient. Previous questionnaires
            stay on file and can still be viewed.
          </DialogDescription>
        </DialogHeader>

        <MedicalHistorySection values={values} onChange={patch} />

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {isSaving ? 'Saving…' : 'Save Questionnaire'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
