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
import { DentistPicker } from '@/components/shared/dentist-picker'
import { TREATMENTS } from '@/components/shared/clinic-roster'
import type {
  PaymentMethod,
  PaymentRow,
  PaymentStatus,
} from '@/components/payments/data'
import type { PatientRow } from '@/components/patients/data'
import type { DentistOption } from '@/lib/data/dentists'
import { addPaymentAction } from '@/app/(app)/payments/actions'

const METHODS: PaymentMethod[] = ['Cash', 'Card', 'Bank', 'GCash', 'Maya']
const STATUSES: PaymentStatus[] = [
  'Paid',
  'Partially Paid',
  'Unpaid',
  'Refunded',
]

interface AddPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patients: PatientRow[]
  dentists: DentistOption[]
  onAdd: (payment: PaymentRow) => void
}

export function AddPaymentDialog({
  open,
  onOpenChange,
  patients,
  dentists,
  onAdd,
}: AddPaymentDialogProps) {
  const [patientId, setPatientId] = useState('')
  const [service, setService] = useState<string>(TREATMENTS[0])
  const [dentistId, setDentistId] = useState(dentists[0]?.id ?? '')
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('Cash')
  const [status, setStatus] = useState<PaymentStatus>('Paid')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setPatientId('')
    setService(TREATMENTS[0])
    setDentistId(dentists[0]?.id ?? '')
    setDate('')
    setAmount('')
    setMethod('Cash')
    setStatus('Paid')
    setError(null)
  }

  const canSubmit =
    patientId.length > 0 &&
    dentistId.length > 0 &&
    date.length > 0 &&
    amount.trim().length > 0 &&
    Number(amount) > 0 &&
    !isSubmitting

  async function handleSubmit() {
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)
    try {
      const payment = await addPaymentAction({
        patientId,
        dentistId,
        treatment: service,
        date,
        amount: Number(amount),
        method,
        status,
      })
      onAdd(payment)
      resetForm()
      onOpenChange(false)
    } catch {
      setError('Could not add payment. Please try again.')
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
          <DialogTitle>New Payment</DialogTitle>
          <DialogDescription>Record a new patient payment.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <PatientPicker
            patients={patients}
            value={patientId}
            onValueChange={setPatientId}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Service/Treatment
            </label>
            <Select
              value={service}
              onValueChange={(value) => value && setService(value)}
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

          <DentistPicker
            dentists={dentists}
            value={dentistId}
            onValueChange={setDentistId}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Payment Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Amount (₱)
              </label>
              <Input
                type="number"
                min={0}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="1500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Payment Method
              </label>
              <Select
                value={method}
                onValueChange={(value) =>
                  value && setMethod(value as PaymentMethod)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Status</label>
              <Select
                value={status}
                onValueChange={(value) =>
                  value && setStatus(value as PaymentStatus)
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
            {isSubmitting ? 'Adding…' : 'Add Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
