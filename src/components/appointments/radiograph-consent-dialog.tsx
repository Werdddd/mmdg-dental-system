'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SignaturePad } from '@/components/shared/signature-pad'
import { Field } from '@/components/patients/intake/form-controls'
import { savePatientRadiographConsentAction } from '@/app/(app)/patients/actions'
import {
  EMPTY_RADIOGRAPH_CONSENT,
  type PatientRadiographConsentRow,
} from '@/lib/data/patient-radiograph-consents'

interface RadiographConsentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  patientName: string
  patientAddress: string
  defaultDentistName?: string
  initialValue?: PatientRadiographConsentRow | null
  onSaved?: (value: PatientRadiographConsentRow) => void
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function RadiographConsentDialog({
  open,
  onOpenChange,
  patientId,
  patientName,
  patientAddress,
  defaultDentistName,
  initialValue,
  onSaved,
}: RadiographConsentDialogProps) {
  function seedForm(): PatientRadiographConsentRow {
    return (
      initialValue ?? {
        ...EMPTY_RADIOGRAPH_CONSENT,
        dentistName: defaultDentistName ?? '',
        signedDate: today(),
      }
    )
  }

  const [form, setForm] = useState<PatientRadiographConsentRow>(seedForm)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wasOpen, setWasOpen] = useState(open)

  // Re-seed the form whenever the dialog opens for a (possibly different)
  // patient. Adjusting state during render (rather than in an effect) avoids
  // an extra render pass — see https://react.dev/learn/you-might-not-need-an-effect.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setForm(seedForm())
      setError(null)
    }
  }

  function patch(update: Partial<PatientRadiographConsentRow>) {
    setForm((prev) => ({ ...prev, ...update }))
  }

  async function handleSave() {
    setIsSaving(true)
    setError(null)
    try {
      await savePatientRadiographConsentAction(patientId, form)
      onSaved?.(form)
      onOpenChange(false)
    } catch {
      setError('Could not save this form. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Radiograph Release of Liability</DialogTitle>
          <DialogDescription>
            Recommended radiographs for {patientName || 'this patient'}&rsquo;s
            first appointment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={form.cbct}
                onCheckedChange={(checked) => patch({ cbct: checked === true })}
              />
              CBCT
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={form.panoramic}
                onCheckedChange={(checked) =>
                  patch({ panoramic: checked === true })
                }
              />
              PANORAMIC
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={form.pfm}
                onCheckedChange={(checked) => patch({ pfm: checked === true })}
              />
              PFM
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Patient Name" >
              <Input value={patientName} readOnly disabled />
            </Field>
            <Field label="Address" >
              <Input value={patientAddress} readOnly disabled />
            </Field>
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm leading-7">
            <p>
              I have been advised to have the following radiographs (x-rays)
              taken as part of a complete and thorough exam, in order to assist
              in thoroughly diagnosing oral or dental disease that may be
              present (some of which can be detected only with radiographs).
            </p>
            <p>
              I understand that by not having the recommended radiographs,
              conditions may arise at any time in the future that could have
              been prevented, detected earlier, and treated more successfully
              and less expensive if the radiographs were taken. These conditions
              can include tooth decay, gum disease, infections, cysts, and
              tumors. Not diagnosing them early could result in more pain and
              discomfort, more expensive treatment, losing teeth that might
              otherwise be saved, and not detecting growths until they are very
              large.
            </p>
            <p>
              I am refusing to have these radiographs taken at this time.
              Therefore release Dr.{' '}
              <Input
                value={form.dentistName}
                onChange={(e) => patch({ dentistName: e.target.value })}
                placeholder="Dentist name"
                className="inline-flex h-7 w-44 px-2 py-0 text-sm"
              />{' '}
              from any and all liability resulting from diseases or pathology,
              now or in the future, that these radiographs might have been
              revealed.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SignaturePad
              label="Patient Signature"
              value={form.patientSignature}
              onChange={(patientSignature) => patch({ patientSignature })}
              nameOptions={[patientName || 'Patient']}
            />
            <div className="space-y-3">
              <SignaturePad
                label="Witness"
                value={form.witnessSignature}
                onChange={(witnessSignature) => patch({ witnessSignature })}
                nameOptions={[form.witnessPrintedName || 'Witness']}
              />
              <Input
                value={form.witnessPrintedName}
                onChange={(e) => patch({ witnessPrintedName: e.target.value })}
                placeholder="Witness name"
                className="h-8 text-xs"
              />
            </div>
            <Field label="Date">
              <Input
                type="date"
                value={form.signedDate}
                onChange={(e) => patch({ signedDate: e.target.value })}
              />
            </Field>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Sign Later
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
