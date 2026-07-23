import { useState } from 'react'
import {
  Banknote,
  CreditCard,
  FileCheck,
  Gift,
  HeartHandshake,
  Landmark,
  MoreHorizontal,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'

import { type badgeVariants } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/status-badge'
import { SignaturePreview } from '@/components/shared/signature-preview'
import { formatCurrency } from '@/lib/utils'
import type { PaymentMethod, PaymentRow, PaymentStatus } from '@/components/payments/data'

const STATUS_VARIANT: Record<
  PaymentStatus,
  VariantProps<typeof badgeVariants>['variant']
> = {
  Paid: 'success',
  Refunded: 'secondary',
}

const METHOD_ICON: Record<PaymentMethod, LucideIcon> = {
  Cash: Banknote,
  Bank: Landmark,
  GCash: Wallet,
  Check: FileCheck,
  PayPal: CreditCard,
  Sponsored: HeartHandshake,
  'Pro Bono': Gift,
}

interface PatientPaymentHistoryTableProps {
  entries: PaymentRow[]
}

export function PatientPaymentHistoryTable({
  entries,
}: PatientPaymentHistoryTableProps) {
  const [selected, setSelected] = useState<PaymentRow | null>(null)

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Invoice ID</TableHead>
            <TableHead>Payment Date</TableHead>
            <TableHead>Treatment</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Remaining Balance</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 && (
            <TableEmpty colSpan={8}>No payment history yet.</TableEmpty>
          )}
          {entries.map((entry) => {
            const MethodIcon = METHOD_ICON[entry.method]
            return (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap font-medium">
                  {entry.invoiceId}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {entry.date}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {entry.service}
                </TableCell>
                <TableCell className="whitespace-nowrap font-medium">
                  {formatCurrency(entry.amount)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MethodIcon className="size-3.5" />
                    {entry.method}
                    {entry.bankName ? ` · ${entry.bankName}` : ''}
                  </span>
                  {entry.referenceNumber && (
                    <p className="text-xs">Ref: {entry.referenceNumber}</p>
                  )}
                  {entry.proofPhotoUrl && (
                    <a
                      href={entry.proofPhotoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      View proof
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={entry.status}
                    variants={STATUS_VARIANT}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap font-medium">
                  {entry.invoiceBalance > 0 ? (
                    formatCurrency(entry.invoiceBalance)
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Payment actions"
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>View receipt</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelected(entry)}>
                        View signature
                      </DropdownMenuItem>
                      <DropdownMenuItem>Print invoice</DropdownMenuItem>
                      {entry.invoiceBalance > 0 && (
                        <DropdownMenuItem>Send reminder</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Patient Signature — {selected.invoiceId}</DialogTitle>
              </DialogHeader>
              <SignaturePreview
                label="Patient Signature"
                signature={selected.signature}
                printedName={selected.signaturePrintedName ?? selected.patient.name}
                date={selected.date}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
