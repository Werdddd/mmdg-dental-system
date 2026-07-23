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

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { type badgeVariants } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { PaymentDetailsDialog } from '@/components/payments/payment-details-dialog'
import { EditPaymentDialog } from '@/components/payments/edit-payment-dialog'
import { RefundPaymentDialog } from '@/components/payments/refund-payment-dialog'
import type {
  PaymentMethod,
  PaymentRow,
  PaymentStatus,
} from '@/components/payments/data'
import { formatCurrency } from '@/lib/utils'

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

interface PaymentsTableProps {
  payments: PaymentRow[]
  onUpdate: (payment: PaymentRow) => void
}

export function PaymentsTable({ payments, onUpdate }: PaymentsTableProps) {
  const [detailsTarget, setDetailsTarget] = useState<PaymentRow | null>(null)
  const [editTarget, setEditTarget] = useState<PaymentRow | null>(null)
  const [refundTarget, setRefundTarget] = useState<PaymentRow | null>(null)

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Payment ID</TableHead>
            <TableHead>Invoice ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Service/Treatment</TableHead>
            <TableHead>Dentist</TableHead>
            <TableHead>Payment Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 && (
            <TableEmpty colSpan={10}>No payments match your search.</TableEmpty>
          )}
          {payments.map((payment) => {
            const MethodIcon = METHOD_ICON[payment.method]
            return (
              <TableRow key={payment.id}>
                <TableCell className="whitespace-nowrap font-medium">
                  {payment.id}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {payment.invoiceId}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback>{payment.patient.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium whitespace-nowrap">
                        {payment.patient.name}
                      </p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {payment.patient.phone}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {payment.service}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {payment.dentist}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {payment.date}
                </TableCell>
                <TableCell className="whitespace-nowrap font-medium">
                  {formatCurrency(payment.amount)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MethodIcon className="size-3.5" />
                    {payment.method}
                    {payment.bankName ? ` · ${payment.bankName}` : ''}
                  </span>
                  {payment.referenceNumber && (
                    <p className="text-xs">Ref: {payment.referenceNumber}</p>
                  )}
                  {payment.proofPhotoUrl && (
                    <a
                      href={payment.proofPhotoUrl}
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
                    status={payment.status}
                    variants={STATUS_VARIANT}
                  />
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
                      <DropdownMenuItem onClick={() => setDetailsTarget(payment)}>
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={payment.status === 'Refunded'}
                        onClick={() => setEditTarget(payment)}
                      >
                        Edit payment
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          window.open(
                            `/payments/${payment.rawId}/receipt`,
                            '_blank',
                          )
                        }
                      >
                        Print receipt
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive data-[highlighted]:text-destructive"
                        disabled={payment.status === 'Refunded'}
                        onClick={() => setRefundTarget(payment)}
                      >
                        Refund payment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <PaymentDetailsDialog
        payment={detailsTarget}
        onOpenChange={(open) => {
          if (!open) setDetailsTarget(null)
        }}
      />

      <EditPaymentDialog
        payment={editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null)
        }}
        onUpdated={(updated) => {
          onUpdate(updated)
          setEditTarget(null)
        }}
      />

      <RefundPaymentDialog
        payment={refundTarget}
        onOpenChange={(open) => {
          if (!open) setRefundTarget(null)
        }}
        onRefunded={(refunded) => {
          onUpdate(refunded)
          setRefundTarget(null)
        }}
      />
    </>
  )
}
