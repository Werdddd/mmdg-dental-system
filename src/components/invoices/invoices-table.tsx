import { MoreHorizontal } from 'lucide-react'
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
import type { InvoiceRow, InvoiceStatus } from '@/components/invoices/data'
import { formatCurrency } from '@/lib/utils'

const STATUS_VARIANT: Record<
  InvoiceStatus,
  VariantProps<typeof badgeVariants>['variant']
> = {
  Paid: 'success',
  'Partially Paid': 'warning',
  Overdue: 'destructive',
  Unpaid: 'secondary',
}

interface InvoicesTableProps {
  invoices: InvoiceRow[]
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Invoice ID</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Treatment/Procedure</TableHead>
          <TableHead>Created Date</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Subtotal</TableHead>
          <TableHead>Tax</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead>Remaining Balance</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.length === 0 && (
          <TableEmpty colSpan={11}>No invoices match your search.</TableEmpty>
        )}
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="whitespace-nowrap font-medium">
              {invoice.id}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback>{invoice.patient.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium whitespace-nowrap">
                    {invoice.patient.name}
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {invoice.patient.phone}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {invoice.treatment}
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {invoice.createdDate}
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {invoice.dueDate}
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatCurrency(invoice.subtotal)}
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatCurrency(invoice.tax)}
            </TableCell>
            <TableCell className="whitespace-nowrap font-medium">
              {formatCurrency(invoice.total)}
            </TableCell>
            <TableCell className="whitespace-nowrap font-medium">
              {invoice.balance > 0 ? (
                formatCurrency(invoice.balance)
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>
              <StatusBadge status={invoice.status} variants={STATUS_VARIANT} />
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Invoice actions"
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>View details</DropdownMenuItem>
                  <DropdownMenuItem>Edit invoice</DropdownMenuItem>
                  <DropdownMenuItem>Send reminder</DropdownMenuItem>
                  <DropdownMenuItem>Download PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
