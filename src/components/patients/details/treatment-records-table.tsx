'use client'

import { useState } from 'react'
import type { VariantProps } from 'class-variance-authority'

import { type badgeVariants } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import type {
  TreatmentRecordRow,
  TreatmentRecordStatus,
} from '@/lib/data/treatment-records'

const STATUS_VARIANT: Record<
  TreatmentRecordStatus,
  VariantProps<typeof badgeVariants>['variant']
> = {
  Pending: 'warning',
  Invoiced: 'success',
  Void: 'secondary',
}

interface TreatmentRecordsTableProps {
  entries: TreatmentRecordRow[]
}

export function TreatmentRecordsTable({ entries }: TreatmentRecordsTableProps) {
  const [showInvoiceHint, setShowInvoiceHint] = useState(false)
  const pendingCount = entries.filter((e) => e.status === 'Pending').length

  return (
    <div className="space-y-2">
      {pendingCount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          <span>
            {pendingCount} treatment{pendingCount === 1 ? '' : 's'} ready to
            bill.
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowInvoiceHint(true)}
          >
            Generate Invoice
          </Button>
        </div>
      )}
      {showInvoiceHint && (
        <p className="text-xs text-muted-foreground">
          Head to the{' '}
          <a href="/invoices" className="underline">
            Invoices
          </a>{' '}
          page and select this patient to choose which treatments to bill.
        </p>
      )}

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Treatment</TableHead>
              <TableHead>Tooth / Branch</TableHead>
              <TableHead>Dentist</TableHead>
              <TableHead>Clinic</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 && (
              <TableEmpty colSpan={7}>
                No treatments have been logged yet.
              </TableEmpty>
            )}
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {entry.performedAt}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {entry.treatment}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {entry.tooth ? `Tooth #${entry.tooth}` : entry.branch ?? '—'}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {entry.dentist}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {entry.clinicName}
                </TableCell>
                <TableCell className="whitespace-nowrap font-medium">
                  {formatCurrency(entry.cost)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={entry.status} variants={STATUS_VARIANT} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
