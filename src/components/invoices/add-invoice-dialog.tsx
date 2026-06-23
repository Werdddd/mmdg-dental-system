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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PatientPicker } from '@/components/shared/patient-picker'
import { TREATMENTS } from '@/components/shared/clinic-roster'
import {
  TAX_RATE,
  type InvoiceRow,
  type InvoiceStatus,
} from '@/components/invoices/data'
import type { PatientRow } from '@/components/patients/data'
import { formatCurrency } from '@/lib/utils'
import { addInvoiceAction } from '@/app/(app)/invoices/actions'

const STATUSES: InvoiceStatus[] = [
  'Paid',
  'Partially Paid',
  'Overdue',
  'Unpaid',
]

interface AddInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patients: PatientRow[]
  onAdd: (invoice: InvoiceRow) => void
}

export function AddInvoiceDialog({
  open,
  onOpenChange,
  patients,
  onAdd,
}: AddInvoiceDialogProps) {
  const [patientId, setPatientId] = useState('')
  const [treatment, setTreatment] = useState<string>(TREATMENTS[0])
  const [dueDate, setDueDate] = useState('')
  const [subtotal, setSubtotal] = useState('')
  const [status, setStatus] = useState<InvoiceStatus>('Unpaid')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setPatientId('')
    setTreatment(TREATMENTS[0])
    setDueDate('')
    setSubtotal('')
    setStatus('Unpaid')
    setError(null)
  }

  const canSubmit =
    patientId.length > 0 &&
    dueDate.length > 0 &&
    subtotal.trim().length > 0 &&
    Number(subtotal) > 0 &&
    !isSubmitting

  async function handleSubmit() {
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)
    try {
      const invoice = await addInvoiceAction({
        patientId,
        treatment,
        dueDate,
        subtotal: Number(subtotal),
        status,
      })
      onAdd(invoice)
      resetForm()
      onOpenChange(false)
    } catch {
      setError('Could not add invoice. Please try again.')
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
          <DialogTitle>New Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for a patient treatment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <PatientPicker
            patients={patients}
            value={patientId}
            onValueChange={setPatientId}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Treatment/Procedure
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Subtotal (₱)
              </label>
              <Input
                type="number"
                min={0}
                value={subtotal}
                onChange={(event) => setSubtotal(event.target.value)}
                placeholder="1500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Status</label>
            <Select
              value={status}
              onValueChange={(value) =>
                value && setStatus(value as InvoiceStatus)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {subtotal.trim().length > 0 && Number(subtotal) > 0 && (
            <p className="text-sm text-muted-foreground">
              Tax (12%):{' '}
              {formatCurrency(Math.round(Number(subtotal) * TAX_RATE))} · Total:{' '}
              {formatCurrency(
                Number(subtotal) + Math.round(Number(subtotal) * TAX_RATE),
              )}
            </p>
          )}

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
            {isSubmitting ? 'Adding…' : 'Add Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
