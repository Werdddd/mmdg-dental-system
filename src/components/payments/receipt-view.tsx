'use client'

import { Button } from '@/components/ui/button'
import { SignaturePreview } from '@/components/shared/signature-preview'
import type { PaymentRow } from '@/components/payments/data'
import { formatCurrency } from '@/lib/utils'

interface ReceiptViewProps {
  payment: PaymentRow
  clinicName: string
  clinicAddress: string | null
}

export function ReceiptView({
  payment,
  clinicName,
  clinicAddress,
}: ReceiptViewProps) {
  return (
    <div className="mx-auto max-w-xl space-y-4 p-8 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-lg font-semibold">Payment Receipt</h1>
        <Button onClick={() => window.print()}>Print</Button>
      </div>

      <div className="space-y-5 rounded-xl border p-6 print:border-none print:p-0">
        <div className="text-center">
          <p className="text-xl font-semibold">{clinicName}</p>
          {clinicAddress && (
            <p className="text-sm text-muted-foreground">{clinicAddress}</p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            Official Payment Receipt
          </p>
        </div>

        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-muted-foreground">Receipt No.</span>
          <span className="text-right font-medium">{payment.id}</span>
          <span className="text-muted-foreground">Invoice</span>
          <span className="text-right">{payment.invoiceId}</span>
          <span className="text-muted-foreground">Date</span>
          <span className="text-right">{payment.date}</span>
          <span className="text-muted-foreground">Patient</span>
          <span className="text-right">{payment.patient.name}</span>
          <span className="text-muted-foreground">Service</span>
          <span className="text-right">{payment.service}</span>
          <span className="text-muted-foreground">Method</span>
          <span className="text-right">
            {payment.method}
            {payment.bankName ? ` · ${payment.bankName}` : ''}
          </span>
          {payment.referenceNumber && (
            <>
              <span className="text-muted-foreground">Reference No.</span>
              <span className="text-right">{payment.referenceNumber}</span>
            </>
          )}
          <span className="text-muted-foreground">Status</span>
          <span className="text-right">{payment.status}</span>
        </div>

        <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
          <span>Amount Paid</span>
          <span>{formatCurrency(payment.amount)}</span>
        </div>

        <SignaturePreview
          label="Patient Signature"
          signature={payment.signature}
          printedName={payment.signaturePrintedName ?? payment.patient.name}
          date={payment.date}
        />
      </div>
    </div>
  )
}
