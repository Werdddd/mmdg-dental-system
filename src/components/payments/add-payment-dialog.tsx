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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { InvoiceRow } from '@/components/invoices/data'
import type { PatientRow } from '@/components/patients/data'
import type { PaymentMethod, PaymentRow } from '@/components/payments/data'
import type { SponsorRow } from '@/lib/data/sponsors'
import { formatCurrency } from '@/lib/utils'
import { recordPaymentAction } from '@/app/(app)/payments/actions'

const METHODS: PaymentMethod[] = [
  'Cash',
  'Card',
  'Bank',
  'GCash',
  'Maya',
  'Sponsored',
  'Pro Bono',
]

interface AddPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoices: InvoiceRow[]
  patients: PatientRow[]
  sponsors: SponsorRow[]
  onAdd: (payment: PaymentRow) => void
}

export function AddPaymentDialog({
  open,
  onOpenChange,
  invoices,
  patients,
  sponsors,
  onAdd,
}: AddPaymentDialogProps) {
  const router = useRouter()
  const [invoiceId, setInvoiceId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('Cash')
  const [sponsorId, setSponsorId] = useState('')
  const [date, setDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedInvoice = invoices.find((inv) => inv.rawId === invoiceId)

  function resetForm() {
    setInvoiceId('')
    setAmount('')
    setMethod('Cash')
    setSponsorId('')
    setDate('')
    setError(null)
  }

  function handleInvoiceChange(rawId: string) {
    setInvoiceId(rawId)
    const invoice = invoices.find((inv) => inv.rawId === rawId)
    setAmount(invoice ? String(invoice.balance) : '')

    const patient = patients.find((p) => p.id === invoice?.patientId)
    if (patient?.sponsorship) {
      setSponsorId(patient.sponsorship.sponsorId)
    }
  }

  const amountValue = Number(amount)
  const canSubmit =
    invoiceId.length > 0 &&
    amount.trim().length > 0 &&
    amountValue > 0 &&
    selectedInvoice != null &&
    amountValue <= selectedInvoice.balance &&
    date.length > 0 &&
    (method !== 'Sponsored' || sponsorId.length > 0) &&
    !isSubmitting

  async function handleSubmit() {
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)
    try {
      const payment = await recordPaymentAction({
        invoiceId,
        amount: amountValue,
        method,
        sponsorId: method === 'Sponsored' ? sponsorId : null,
        date,
      })
      onAdd(payment)
      resetForm()
      onOpenChange(false)
      router.refresh()
    } catch {
      setError('Could not record payment. Please try again.')
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
          <DialogDescription>
            Record a payment against an existing invoice.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Invoice</label>
            {invoices.length === 0 ? (
              <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                No outstanding invoices — generate an invoice first.
              </p>
            ) : (
              <Select
                value={invoiceId}
                onValueChange={(value) => value && handleInvoiceChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(id: string) => {
                      const invoice = invoices.find((inv) => inv.rawId === id)
                      return invoice
                        ? `${invoice.id} — ${invoice.patient.name} — Balance ${formatCurrency(invoice.balance)}`
                        : 'Select an invoice'
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {invoices.map((invoice) => (
                    <SelectItem key={invoice.rawId} value={invoice.rawId}>
                      {invoice.id} — {invoice.patient.name} — Balance{' '}
                      {formatCurrency(invoice.balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
                max={selectedInvoice?.balance}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="1500"
              />
              {selectedInvoice && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Remaining balance: {formatCurrency(selectedInvoice.balance)}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Payment Method
            </label>
            <Select
              value={method}
              onValueChange={(value) => value && setMethod(value as PaymentMethod)}
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

          {method === 'Sponsored' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Sponsor
              </label>
              {sponsors.length === 0 ? (
                <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                  No sponsors yet — add one from the Sponsors page first.
                </p>
              ) : (
                <Select
                  value={sponsorId}
                  onValueChange={(value) => value && setSponsorId(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(id: string) =>
                        sponsors.find((s) => s.id === id)?.name ??
                        'Select a sponsor'
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {sponsors.map((sponsor) => (
                      <SelectItem key={sponsor.id} value={sponsor.id}>
                        {sponsor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
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
            {isSubmitting ? 'Recording…' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
