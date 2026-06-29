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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DentistPicker } from '@/components/shared/dentist-picker'
import { formatToothLabel, TOOTH_CONDITIONS } from '@/lib/dental/teeth'
import type { ToothRecord } from '@/lib/data/dental-chart'
import type { DentistOption } from '@/lib/data/dentists'
import { updateToothRecordAction } from '@/app/(app)/patients/actions'

interface ToothRecordFormProps {
  patientId: string
  tooth: number
  record: ToothRecord
  dentists: DentistOption[]
  onCancel: () => void
  onSaved: () => void
}

function ToothRecordForm({
  patientId,
  tooth,
  record,
  dentists,
  onCancel,
  onSaved,
}: ToothRecordFormProps) {
  const router = useRouter()
  const [condition, setCondition] = useState(record.condition)
  const [treatmentPerformed, setTreatmentPerformed] = useState(
    record.treatmentPerformed === '—' ? '' : record.treatmentPerformed,
  )
  const [dentistId, setDentistId] = useState(record.dentistId ?? '')
  const [notes, setNotes] = useState(record.notes)
  const [cost, setCost] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setIsSubmitting(true)
    setError(null)
    try {
      await updateToothRecordAction(patientId, tooth, {
        condition,
        treatmentPerformed,
        notes,
        dentistId: dentistId || null,
        cost: cost.trim() ? Number(cost) : undefined,
      })
      onSaved()
      router.refresh()
    } catch {
      setError('Could not save this tooth record. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Condition
          </label>
          <Select
            value={condition}
            onValueChange={(value) => value && setCondition(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{(value: string) => value}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TOOTH_CONDITIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Treatment Performed{' '}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </label>
          <Input
            value={treatmentPerformed}
            onChange={(event) => setTreatmentPerformed(event.target.value)}
            placeholder="e.g. Composite Filling, Root Canal Therapy"
          />
        </div>

        <DentistPicker
          dentists={dentists}
          value={dentistId}
          onValueChange={setDentistId}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Cost (₱){' '}
            <span className="font-normal text-muted-foreground">
              (optional — leave blank to record clinical notes only)
            </span>
          </label>
          <Input
            type="number"
            min={0}
            value={cost}
            onChange={(event) => setCost(event.target.value)}
            placeholder="0"
          />
          {cost.trim() && Number(cost) > 0 && !treatmentPerformed.trim() && (
            <p className="mt-1 text-xs text-destructive">
              Enter a treatment performed to bill this cost.
            </p>
          )}
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
            placeholder="Clinical observations for this tooth…"
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
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save Record'}
        </Button>
      </DialogFooter>
    </>
  )
}

interface ToothRecordDialogProps {
  patientId: string
  tooth: number | null
  record: ToothRecord | undefined
  dentists: DentistOption[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ToothRecordDialog({
  patientId,
  tooth,
  record,
  dentists,
  open,
  onOpenChange,
}: ToothRecordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {tooth != null ? formatToothLabel(tooth) : 'Tooth Record'}
          </DialogTitle>
          <DialogDescription>
            Record the condition and treatment for this tooth.
          </DialogDescription>
        </DialogHeader>

        {open && tooth != null && record && (
          <ToothRecordForm
            key={tooth}
            patientId={patientId}
            tooth={tooth}
            record={record}
            dentists={dentists}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
