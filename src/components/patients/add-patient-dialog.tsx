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
import type { PatientRow } from '@/components/patients/data'
import {
  EMPTY_PATIENT_FORM_VALUES,
  PatientFormFields,
  formValuesToInput,
  type PatientFormValues,
} from '@/components/patients/patient-form-fields'
import { addPatientAction } from '@/app/(app)/patients/actions'

interface AddPatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (patient: PatientRow) => void
}

export function AddPatientDialog({
  open,
  onOpenChange,
  onAdd,
}: AddPatientDialogProps) {
  const [values, setValues] = useState<PatientFormValues>(
    EMPTY_PATIENT_FORM_VALUES,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setValues(EMPTY_PATIENT_FORM_VALUES)
    setError(null)
  }

  const canSubmit =
    values.fullName.trim().length > 0 &&
    values.phone.trim().length > 0 &&
    values.address.trim().length > 0 &&
    values.birthday.length > 0 &&
    !isSubmitting

  async function handleSubmit() {
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)
    try {
      const patient = await addPatientAction(formValuesToInput(values))
      onAdd(patient)
      resetForm()
      onOpenChange(false)
    } catch {
      setError('Could not add patient. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) resetForm()
      }}
    >
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Patient</DialogTitle>
          <DialogDescription>
            Register a new patient at your clinic.
          </DialogDescription>
        </DialogHeader>

        <PatientFormFields
          values={values}
          onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
        />

        {error && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? 'Adding…' : 'Add Patient'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
