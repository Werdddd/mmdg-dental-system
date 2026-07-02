'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  PatientFormFields,
  formValuesToInput,
  patientToFormValues,
  type PatientFormValues,
} from '@/components/patients/patient-form-fields'
import { updatePatientAction } from '@/app/(app)/patients/actions'

interface EditPatientFormProps {
  patient: PatientRow
  onCancel: () => void
  onSaved: () => void
}

function EditPatientForm({
  patient,
  onCancel,
  onSaved,
}: EditPatientFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<PatientFormValues>(() =>
    patientToFormValues(patient),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      await updatePatientAction(patient.id, formValuesToInput(values))
      onSaved()
      router.refresh()
    } catch {
      setError('Could not save changes. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
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
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </>
  )
}

interface EditPatientDialogProps {
  patient: PatientRow
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPatientDialog({
  patient,
  open,
  onOpenChange,
}: EditPatientDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
          <DialogDescription>
            Update {patient.name}&apos;s details.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <EditPatientForm
            key={patient.id}
            patient={patient}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
