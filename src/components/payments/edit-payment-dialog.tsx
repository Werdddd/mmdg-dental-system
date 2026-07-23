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
import { SignaturePad } from '@/components/shared/signature-pad'
import type { PaymentMethod, PaymentRow } from '@/components/payments/data'
import type { SignatureValue } from '@/lib/dental/signature'
import { formatCurrency } from '@/lib/utils'
import { updatePaymentAction } from '@/app/(app)/payments/actions'

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

interface EditPaymentFormProps {
  payment: PaymentRow
  onCancel: () => void
  onSaved: (payment: PaymentRow) => void
}

function EditPaymentForm({ payment, onCancel, onSaved }: EditPaymentFormProps) {
  const router = useRouter()
  const [amount, setAmount] = useState(String(payment.amount))
  const [method, setMethod] = useState<PaymentMethod>(payment.method)
  const [date, setDate] = useState(payment.rawDate)
  const [bankName, setBankName] = useState(payment.bankName ?? '')
  const [referenceNumber, setReferenceNumber] = useState(
    payment.referenceNumber ?? '',
  )
  const [proofPhoto, setProofPhoto] = useState<File | null>(null)
  const [signature, setSignature] = useState<SignatureValue | null>(
    payment.signature,
  )
  const [signaturePrintedName, setSignaturePrintedName] = useState(
    payment.signaturePrintedName ?? payment.patient.name,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const maxAmount = payment.invoiceBalance + payment.amount
  const amountValue = Number(amount)
  const canSubmit =
    amount.trim().length > 0 &&
    amountValue > 0 &&
    amountValue <= maxAmount &&
    date.length > 0 &&
    signature !== null &&
    !isSubmitting

  async function handleSubmit() {
    if (!canSubmit || !signature) return

    setIsSubmitting(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.set('paymentId', payment.rawId)
      formData.set('amount', String(amountValue))
      formData.set('method', method)
      formData.set('date', date)
      formData.set('bankName', bankName)
      formData.set('referenceNumber', referenceNumber)
      if (proofPhoto) formData.set('proofPhoto', proofPhoto)
      formData.set('signatureType', signature.type)
      formData.set('signatureData', signature.data)
      formData.set('signaturePrintedName', signaturePrintedName)

      const updated = await updatePaymentAction(formData)
      onSaved(updated)
      router.refresh()
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not update payment. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
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
              max={maxAmount}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Max: {formatCurrency(maxAmount)}
            </p>
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
                  (optional — leave blank to keep the current file)
                </span>
              </label>
              {payment.proofPhotoUrl && (
                <a
                  href={payment.proofPhotoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-1.5 block text-xs text-primary hover:underline"
                >
                  View current proof of payment
                </a>
              )}
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
            nameOptions={[payment.patient.name]}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Printed Name
            </label>
            <Input
              value={signaturePrintedName}
              onChange={(event) => setSignaturePrintedName(event.target.value)}
              placeholder={payment.patient.name}
            />
          </div>
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
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </>
  )
}

interface EditPaymentDialogProps {
  payment: PaymentRow | null
  onOpenChange: (open: boolean) => void
  onUpdated: (payment: PaymentRow) => void
}

export function EditPaymentDialog({
  payment,
  onOpenChange,
  onUpdated,
}: EditPaymentDialogProps) {
  return (
    <Dialog open={payment !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
          <DialogDescription>
            {payment &&
              `${payment.id} — ${payment.invoiceId} — ${payment.patient.name}`}
          </DialogDescription>
        </DialogHeader>

        {payment && (
          <EditPaymentForm
            key={payment.rawId}
            payment={payment}
            onCancel={() => onOpenChange(false)}
            onSaved={(updated) => {
              onUpdated(updated)
              onOpenChange(false)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
