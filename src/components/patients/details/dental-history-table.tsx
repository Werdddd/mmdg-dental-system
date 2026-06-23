import { MoreHorizontal } from 'lucide-react'
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
import type { DentalHistoryEntry } from '@/components/patients/details/data'

const STATUS_VARIANT: Record<
  DentalHistoryEntry['status'],
  VariantProps<typeof badgeVariants>['variant']
> = {
  Completed: 'success',
  Ongoing: 'warning',
  Cancelled: 'destructive',
}

interface DentalHistoryTableProps {
  entries: DentalHistoryEntry[]
}

export function DentalHistoryTable({ entries }: DentalHistoryTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Date &amp; Time</TableHead>
            <TableHead>Procedure</TableHead>
            <TableHead>Tooth / Area</TableHead>
            <TableHead>Diagnosis</TableHead>
            <TableHead>Dentist</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 && (
            <TableEmpty colSpan={7}>No dental history recorded yet.</TableEmpty>
          )}
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="whitespace-nowrap">
                <p className="font-medium">{entry.date}</p>
                <p className="text-xs text-muted-foreground">{entry.time}</p>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {entry.procedure}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {entry.toothArea}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {entry.diagnosis}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {entry.dentist}
              </TableCell>
              <TableCell>
                <StatusBadge status={entry.status} variants={STATUS_VARIANT} />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="Dental history actions"
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>View record</DropdownMenuItem>
                    <DropdownMenuItem>Print report</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
