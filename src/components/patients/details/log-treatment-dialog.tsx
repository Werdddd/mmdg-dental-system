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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DentistPicker } from '@/components/shared/dentist-picker'
import { TREATMENTS } from '@/components/shared/clinic-roster'
import { CLINIC_BRANCHES, type ClinicBranch } from '@/lib/dental/branches'
import type { DentistOption } from '@/lib/data/dentists'
import { createTreatmentRecordAction } from '@/app/(app)/patients/actions'

interface LogTreatmentDialogProps {
  patientId: string
  dentists: DentistOption[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogTreatmentDialog({
  patientId,
  dentists,
  open,
  onOpenChange,
}: LogTreatmentDialogProps) {
  const router = useRouter()
  const [treatment, setTreatment] = useState<string>(TREATMENTS[0])
  const [branch, setBranch] = useState<ClinicBranch>(CLINIC_BRANCHES[0])
  const [dentistId, setDentistId] = useState(dentists[0]?.id ?? '')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setTreatment(TREATMENTS[0])
    setBranch(CLINIC_BRANCHES[0])
    setDentistId(dentists[0]?.id ?? '')
    setCost('')
    setNotes('')
    setError(null)
  }

  const canSubmit =
    treatment.trim().length > 0 &&
    cost.trim().length > 0 &&
    Number(cost) > 0 &&
    !isSubmitting

  async function handleSubmit() {
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)
    try {
      await createTreatmentRecordAction({
        patientId,
        treatment,
        dentistId: dentistId || null,
        cost: Number(cost),
        branch,
        notes,
      })
      resetForm()
      onOpenChange(false)
      router.refresh()
    } catch {
      setError('Could not log this treatment. Please try again.')
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Treatment</DialogTitle>
          <DialogDescription>
            Record billable clinical work that isn&apos;t tied to a specific
            tooth — cleanings, consultations, whole-mouth procedures.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Treatment
            </label>
            <Select
              value={treatment}
              onValueChange={(value) => value && setTreatment(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TREATMENTS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Branch</label>
            <Select
              value={branch}
              onValueChange={(value) => value && setBranch(value as ClinicBranch)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLINIC_BRANCHES.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DentistPicker
            dentists={dentists}
            value={dentistId}
            onValueChange={setDentistId}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Cost (₱)
            </label>
            <Input
              type="number"
              min={0}
              value={cost}
              onChange={(event) => setCost(event.target.value)}
              placeholder="500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Notes{' '}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Clinical notes for this treatment…"
              className="min-h-[72px]"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? 'Logging…' : 'Log Treatment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
