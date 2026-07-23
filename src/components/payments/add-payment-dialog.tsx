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
import type { PaymentMethod, PaymentRow } from '@/components/payments/data'
import type { DentistOption } from '@/lib/data/dentists'
import { formatCurrency } from '@/lib/utils'
import { recordPaymentAction } from '@/app/(app)/payments/actions'
import {
  SignaturePad,
  type SignatureValue,
} from '@/components/shared/signature-pad'
import { PostPaymentFollowUpDialog } from '@/components/payments/post-payment-followup-dialog'

const METHODS: PaymentMethod[] = [
  'Cash',
  'Bank',
  'GCash',
  'Check',
  'PayPal',
  'Sponsored',
  'Pro Bono',
]

const METHODS_WITH_REFERENCE: PaymentMethod[] = ['Bank', 'GCash', 'Check', 'PayPal']

interface AddPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoices: InvoiceRow[]
  dentists: DentistOption[]
  onAdd: (payment: PaymentRow) => void
}

export function AddPaymentDialog({
  open,
  onOpenChange,
  invoices,
  dentists,
  onAdd,
}: AddPaymentDialogProps) {
  const router = useRouter()
  const [followUp, setFollowUp] = useState<{
    patientId: string
    patientName: string
  } | null>(null)
  const [invoiceId, setInvoiceId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('Cash')
  const [date, setDate] = useState('')
  const [bankName, setBankName] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [proofPhoto, setProofPhoto] = useState<File | null>(null)
  const [signature, setSignature] = useState<SignatureValue | null>(null)
  const [signaturePrintedName, setSignaturePrintedName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedInvoice = invoices.find((inv) => inv.rawId === invoiceId)

  function resetForm() {
    setInvoiceId('')
    setAmount('')
    setMethod('Cash')
    setDate('')
    setBankName('')
    setReferenceNumber('')
    setProofPhoto(null)
    setSignature(null)
    setSignaturePrintedName('')
    setError(null)
  }

  function handleInvoiceChange(rawId: string) {
    setInvoiceId(rawId)
    const invoice = invoices.find((inv) => inv.rawId === rawId)
    setAmount(invoice ? String(invoice.balance) : '')
    setSignaturePrintedName(invoice?.patient.name ?? '')
  }

  function handleMethodChange(value: PaymentMethod) {
    setMethod(value)
    setBankName('')
    setReferenceNumber('')
    setProofPhoto(null)
  }

  const amountValue = Number(amount)
  const canSubmit =
    invoiceId.length > 0 &&
    amount.trim().length > 0 &&
    amountValue > 0 &&
    selectedInvoice != null &&
    amountValue <= selectedInvoice.balance &&
    date.length > 0 &&
    signature !== null &&
    !isSubmitting

  async function handleSubmit() {
    if (!canSubmit || !signature) return

    setIsSubmitting(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.set('invoiceId', invoiceId)
      formData.set('amount', String(amountValue))
      formData.set('method', method)
      formData.set('date', date)
      formData.set('bankName', bankName)
      formData.set('referenceNumber', referenceNumber)
      if (proofPhoto) formData.set('proofPhoto', proofPhoto)
      formData.set('signatureType', signature.type)
      formData.set('signatureData', signature.data)
      formData.set('signaturePrintedName', signaturePrintedName)

      const payment = await recordPaymentAction(formData)
      onAdd(payment)
      resetForm()
      onOpenChange(false)
      router.refresh()
      setFollowUp({
        patientId: payment.patientId,
        patientName: payment.patient.name,
      })
    } catch {
      setError('Could not record payment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          onOpenChange(next)
          if (!next) resetForm()
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Payment</DialogTitle>
            <DialogDescription>
              Record a payment against an existing invoice.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Invoice
              </label>
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
                onValueChange={(value) =>
                  value && handleMethodChange(value as PaymentMethod)
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

            {METHODS_WITH_REFERENCE.includes(method) && (
              <div className="space-y-4 rounded-lg border border-dashed p-3">
                {method === 'Bank' && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Bank Name{' '}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </label>
                    <Input
                      value={bankName}
                      onChange={(event) => setBankName(event.target.value)}
                      placeholder="e.g. BDO, BPI"
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Reference Number{' '}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </label>
                  <Input
                    value={referenceNumber}
                    onChange={(event) => setReferenceNumber(event.target.value)}
                    placeholder="e.g. REF123456789"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Proof of Payment{' '}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setProofPhoto(event.target.files?.[0] ?? null)
                    }
                  />
                </div>
              </div>
            )}

            <div className="space-y-3 rounded-lg border border-dashed p-3">
              <SignaturePad
                label="Patient Signature"
                required
                value={signature}
                onChange={setSignature}
                nameOptions={[
                  selectedInvoice?.patient.name ?? signaturePrintedName,
                ].filter(Boolean)}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Printed Name
                </label>
                <Input
                  value={signaturePrintedName}
                  onChange={(event) =>
                    setSignaturePrintedName(event.target.value)
                  }
                  placeholder={selectedInvoice?.patient.name ?? 'Patient name'}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                The patient must sign to acknowledge the treatment(s) covered by
                this payment.
              </p>
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
              {isSubmitting ? 'Recording…' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PostPaymentFollowUpDialog
        open={followUp !== null}
        onOpenChange={(next) => {
          if (!next) setFollowUp(null)
        }}
        patientId={followUp?.patientId ?? ''}
        patientName={followUp?.patientName ?? ''}
        dentists={dentists}
      />
    </>
  )
}
