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
import type { PaymentRow } from '@/components/payments/data'
import { formatCurrency } from '@/lib/utils'
import { refundPaymentAction } from '@/app/(app)/payments/actions'

interface RefundPaymentDialogProps {
  payment: PaymentRow | null
  onOpenChange: (open: boolean) => void
  onRefunded: (payment: PaymentRow) => void
}

export function RefundPaymentDialog({
  payment,
  onOpenChange,
  onRefunded,
}: RefundPaymentDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!payment) return

    setIsSubmitting(true)
    setError(null)
    try {
      const refunded = await refundPaymentAction(payment.rawId)
      onRefunded(refunded)
      onOpenChange(false)
      router.refresh()
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not refund this payment. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={payment !== null}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setError(null)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refund Payment</DialogTitle>
          <DialogDescription>
            {payment &&
              `This marks ${payment.id} (${formatCurrency(payment.amount)}) as refunded and restores that amount to ${payment.invoiceId}'s balance. This cannot be undone.`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Refunding…' : 'Refund Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
