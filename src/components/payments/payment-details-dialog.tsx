import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { SignaturePreview } from '@/components/shared/signature-preview'
import type { PaymentRow, PaymentStatus } from '@/components/payments/data'
import { formatCurrency } from '@/lib/utils'

const STATUS_VARIANT: Record<PaymentStatus, 'success' | 'secondary'> = {
  Paid: 'success',
  Refunded: 'secondary',
}

interface PaymentDetailsDialogProps {
  payment: PaymentRow | null
  onOpenChange: (open: boolean) => void
}

export function PaymentDetailsDialog({
  payment,
  onOpenChange,
}: PaymentDetailsDialogProps) {
  return (
    <Dialog open={payment !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {payment && (
          <>
            <DialogHeader>
              <DialogTitle>{payment.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-y-2">
                <span className="text-muted-foreground">Invoice</span>
                <span>{payment.invoiceId}</span>
                <span className="text-muted-foreground">Patient</span>
                <span>{payment.patient.name}</span>
                <span className="text-muted-foreground">Service</span>
                <span>{payment.service}</span>
                <span className="text-muted-foreground">Dentist</span>
                <span>{payment.dentist}</span>
                <span className="text-muted-foreground">Date</span>
                <span>{payment.date}</span>
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  {formatCurrency(payment.amount)}
                </span>
                <span className="text-muted-foreground">Method</span>
                <span>
                  {payment.method}
                  {payment.bankName ? ` · ${payment.bankName}` : ''}
                </span>
                {payment.referenceNumber && (
                  <>
                    <span className="text-muted-foreground">Reference No.</span>
                    <span>{payment.referenceNumber}</span>
                  </>
                )}
                <span className="text-muted-foreground">Status</span>
                <span>
                  <StatusBadge
                    status={payment.status}
                    variants={STATUS_VARIANT}
                  />
                </span>
                <span className="text-muted-foreground">Remaining Balance</span>
                <span>{formatCurrency(payment.invoiceBalance)}</span>
              </div>

              {payment.proofPhotoUrl && (
                <a
                  href={payment.proofPhotoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View proof of payment
                </a>
              )}

              <SignaturePreview
                label="Patient Signature"
                signature={payment.signature}
                printedName={payment.signaturePrintedName ?? payment.patient.name}
                date={payment.date}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
