import {
  Banknote,
  CreditCard,
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
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatCurrency } from '@/lib/utils'
import type { PatientPaymentEntry } from '@/components/patients/details/data'
import type { PaymentMethod } from '@/components/payments/data'
import type { InvoiceStatus } from '@/components/invoices/data'

const STATUS_VARIANT: Record<
  InvoiceStatus,
  VariantProps<typeof badgeVariants>['variant']
> = {
  Paid: 'success',
  'Partially Paid': 'warning',
  Overdue: 'destructive',
  Unpaid: 'secondary',
}

const METHOD_ICON: Record<PaymentMethod, LucideIcon> = {
  Cash: Banknote,
  Card: CreditCard,
  Bank: Landmark,
  GCash: Wallet,
  Maya: Wallet,
}

interface PatientPaymentHistoryTableProps {
  entries: PatientPaymentEntry[]
}

export function PatientPaymentHistoryTable({
  entries,
}: PatientPaymentHistoryTableProps) {
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
                  {entry.treatment}
                </TableCell>
                <TableCell className="whitespace-nowrap font-medium">
                  {formatCurrency(entry.amount)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MethodIcon className="size-3.5" />
                    {entry.method}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={entry.status}
                    variants={STATUS_VARIANT}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap font-medium">
                  {entry.remainingBalance > 0 ? (
                    formatCurrency(entry.remainingBalance)
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
                      <DropdownMenuItem>Print invoice</DropdownMenuItem>
                      {entry.remainingBalance > 0 && (
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
    </div>
  )
}
