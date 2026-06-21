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
import { DENTISTS, TREATMENTS } from '@/components/shared/clinic-roster'
import type {
  PaymentMethod,
  PaymentRow,
  PaymentStatus,
} from '@/components/payments/data'
import { formatDisplayDate, initialsOf, nextSequentialId } from '@/lib/utils'

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
  payments: PaymentRow[]
  onAdd: (payment: PaymentRow) => void
}

export function AddPaymentDialog({
  open,
  onOpenChange,
  payments,
  onAdd,
}: AddPaymentDialogProps) {
  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [invoiceId, setInvoiceId] = useState('')
  const [service, setService] = useState<string>(TREATMENTS[0])
  const [dentistId, setDentistId] = useState(DENTISTS[0]?.id ?? '')
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('Cash')
  const [status, setStatus] = useState<PaymentStatus>('Paid')

  function resetForm() {
    setPatientName('')
    setPatientPhone('')
    setInvoiceId('')
    setService(TREATMENTS[0])
    setDentistId(DENTISTS[0]?.id ?? '')
    setDate('')
    setAmount('')
    setMethod('Cash')
    setStatus('Paid')
  }

  const dentist = DENTISTS.find((d) => d.id === dentistId)
  const canSubmit =
    patientName.trim().length > 0 &&
    patientPhone.trim().length > 0 &&
    dentist != null &&
    date.length > 0 &&
    amount.trim().length > 0 &&
    Number(amount) > 0

  function handleSubmit() {
    if (!canSubmit || !dentist) return

    onAdd({
      id: nextSequentialId(payments, (p) => p.id, 'PAY-'),
      invoiceId: invoiceId.trim() || '—',
      patient: {
        name: patientName.trim(),
        initials: initialsOf(patientName),
        phone: patientPhone.trim(),
      },
      service,
      dentist: dentist.name,
      date: formatDisplayDate(date),
      amount: Number(amount),
      method,
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
          <DialogTitle>New Payment</DialogTitle>
          <DialogDescription>Record a new patient payment.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <PatientFields
            name={patientName}
            onNameChange={setPatientName}
            phone={patientPhone}
            onPhoneChange={setPatientPhone}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Invoice ID
              </label>
              <Input
                value={invoiceId}
                onChange={(event) => setInvoiceId(event.target.value)}
                placeholder="INV-2055"
              />
            </div>
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
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Dentist</label>
            <Select
              value={dentistId}
              onValueChange={(value) => value && setDentistId(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DENTISTS.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} — {d.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Add Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
