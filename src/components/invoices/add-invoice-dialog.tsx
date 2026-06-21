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
import { PatientFields } from '@/components/shared/patient-fields'
import { TREATMENTS } from '@/components/shared/clinic-roster'
import {
  TAX_RATE,
  type InvoiceRow,
  type InvoiceStatus,
} from '@/components/invoices/data'
import {
  formatCurrency,
  formatDisplayDate,
  initialsOf,
  MOCK_TODAY,
  nextSequentialId,
} from '@/lib/utils'

const STATUSES: InvoiceStatus[] = [
  'Paid',
  'Partially Paid',
  'Overdue',
  'Unpaid',
]

interface AddInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoices: InvoiceRow[]
  onAdd: (invoice: InvoiceRow) => void
}

export function AddInvoiceDialog({
  open,
  onOpenChange,
  invoices,
  onAdd,
}: AddInvoiceDialogProps) {
  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [treatment, setTreatment] = useState<string>(TREATMENTS[0])
  const [dueDate, setDueDate] = useState('')
  const [subtotal, setSubtotal] = useState('')
  const [status, setStatus] = useState<InvoiceStatus>('Unpaid')

  function resetForm() {
    setPatientName('')
    setPatientPhone('')
    setTreatment(TREATMENTS[0])
    setDueDate('')
    setSubtotal('')
    setStatus('Unpaid')
  }

  const canSubmit =
    patientName.trim().length > 0 &&
    patientPhone.trim().length > 0 &&
    dueDate.length > 0 &&
    subtotal.trim().length > 0 &&
    Number(subtotal) > 0

  function handleSubmit() {
    if (!canSubmit) return

    const subtotalAmount = Number(subtotal)
    const tax = Math.round(subtotalAmount * TAX_RATE)
    const total = subtotalAmount + tax
    const balance = status === 'Paid' ? 0 : total

    onAdd({
      id: nextSequentialId(invoices, (i) => i.id, 'INV-'),
      patient: {
        name: patientName.trim(),
        initials: initialsOf(patientName),
        phone: patientPhone.trim(),
      },
      treatment,
      createdDate: MOCK_TODAY,
      dueDate: formatDisplayDate(dueDate),
      subtotal: subtotalAmount,
      tax,
      total,
      balance,
      status,
    })
    resetForm()
    onOpenChange(false)
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
          <PatientFields
            name={patientName}
            onNameChange={setPatientName}
            phone={patientPhone}
            onPhoneChange={setPatientPhone}
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Add Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
