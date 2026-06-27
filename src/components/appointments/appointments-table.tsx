import { MoreHorizontal } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import type { AppointmentRow } from '@/components/appointments/data'
import { STATUS_VARIANT } from '@/components/appointments/data'

interface AppointmentsTableProps {
  appointments: AppointmentRow[]
  onRowClick?: (appointment: AppointmentRow) => void
  containerClassName?: string
  stickyHeader?: boolean
}

export function AppointmentsTable({
  appointments,
  onRowClick,
  containerClassName,
  stickyHeader,
}: AppointmentsTableProps) {
  return (
    <Table containerClassName={containerClassName}>
      <TableHeader
        className={stickyHeader ? 'sticky top-0 z-10 bg-card' : undefined}
      >
        <TableRow className="hover:bg-transparent">
          <TableHead>Date &amp; Time</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Dentist</TableHead>
          <TableHead>Treatment Done</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.length === 0 && (
          <TableEmpty colSpan={6}>
            No appointments match your search.
          </TableEmpty>
        )}
        {appointments.map((appt) => (
          <TableRow
            key={appt.id}
            className={onRowClick ? 'cursor-pointer' : undefined}
            onClick={() => onRowClick?.(appt)}
          >
            <TableCell className="whitespace-nowrap">
              <p className="font-medium">{appt.date}</p>
              <p className="text-xs text-muted-foreground">{appt.time}</p>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback>{appt.patient.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium whitespace-nowrap">
                    {appt.patient.name}
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {appt.patient.phone}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback>{appt.dentist.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium whitespace-nowrap">
                    {appt.dentist.name}
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {appt.dentist.specialty}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell className="max-w-[200px]">
              {appt.notes ? (
                <p className="truncate text-sm text-muted-foreground">
                  {appt.notes}
                </p>
              ) : (
                <span className="text-sm text-muted-foreground/50">—</span>
              )}
            </TableCell>
            <TableCell>
              <StatusBadge status={appt.status} variants={STATUS_VARIANT} />
            </TableCell>
            <TableCell
              className="text-right"
              onClick={(event) => event.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Appointment actions"
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onRowClick?.(appt)}>
                    View details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
