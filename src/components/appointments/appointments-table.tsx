import { MoreHorizontal, Phone, Video, MapPin } from 'lucide-react'

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
import type { VariantProps } from 'class-variance-authority'
import type {
  AppointmentRow,
  AppointmentStatus,
} from '@/components/appointments/data'

const STATUS_VARIANT: Record<
  AppointmentStatus,
  VariantProps<typeof badgeVariants>['variant']
> = {
  Confirmed: 'purple',
  Completed: 'success',
  Ongoing: 'warning',
  Cancelled: 'destructive',
  Rescheduled: 'info',
}

const MODE_ICON = {
  'In-person': MapPin,
  'Video Call': Video,
  'Phone Call': Phone,
} as const

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
          <TableHead>Mode</TableHead>
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
        {appointments.map((appt) => {
          const ModeIcon = MODE_ICON[appt.mode]
          return (
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
              <TableCell className="whitespace-nowrap text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <ModeIcon className="size-3.5" />
                  {appt.mode}
                </span>
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
                    <DropdownMenuItem>Reschedule</DropdownMenuItem>
                    <DropdownMenuItem>Cancel appointment</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
