import { MoreHorizontal } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { type badgeVariants } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/status-badge'

interface Appointment {
  patient: string
  initials: string
  reason: string
  date: string
  time: string
  status: 'Confirmed' | 'Pending' | 'Cancelled'
}

const APPOINTMENTS: Appointment[] = [
  {
    patient: 'Maria Santos',
    initials: 'MS',
    reason: 'Routine Cleaning',
    date: 'Jun 21, 2026',
    time: '9:00 AM',
    status: 'Confirmed',
  },
  {
    patient: 'James Cruz',
    initials: 'JC',
    reason: 'Root Canal Follow-up',
    date: 'Jun 21, 2026',
    time: '10:30 AM',
    status: 'Pending',
  },
  {
    patient: 'Liza Fernandez',
    initials: 'LF',
    reason: 'Tooth Extraction',
    date: 'Jun 21, 2026',
    time: '1:15 PM',
    status: 'Confirmed',
  },
  {
    patient: 'Noah Bautista',
    initials: 'NB',
    reason: 'Dental Checkup',
    date: 'Jun 22, 2026',
    time: '11:00 AM',
    status: 'Cancelled',
  },
  {
    patient: 'Ana Lim',
    initials: 'AL',
    reason: 'Braces Adjustment',
    date: 'Jun 22, 2026',
    time: '3:30 PM',
    status: 'Confirmed',
  },
  {
    patient: 'Mark Tan',
    initials: 'MT',
    reason: 'Consultation',
    date: 'Jun 24, 2026',
    time: '9:00 AM',
    status: 'Pending',
  },
  {
    patient: 'Carla Reyes',
    initials: 'CR',
    reason: 'Teeth Whitening',
    date: 'Jun 24, 2026',
    time: '2:00 PM',
    status: 'Confirmed',
  },
  {
    patient: 'Paolo Mendoza',
    initials: 'PM',
    reason: 'Dental Implant Review',
    date: 'Jun 25, 2026',
    time: '10:00 AM',
    status: 'Confirmed',
  },
  {
    patient: 'Grace Villanueva',
    initials: 'GV',
    reason: 'Routine Cleaning',
    date: 'Jun 25, 2026',
    time: '4:00 PM',
    status: 'Pending',
  },
]

const STATUS_VARIANT: Record<
  Appointment['status'],
  VariantProps<typeof badgeVariants>['variant']
> = {
  Confirmed: 'success',
  Pending: 'warning',
  Cancelled: 'destructive',
}

export function RecentAppointmentsTable() {
  return (
    <div className="flex h-[32rem] flex-col rounded-xl border bg-card shadow-sm">
      <div className="flex shrink-0 items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">Recent Appointments</h2>
          <p className="text-sm text-muted-foreground">
            Today and upcoming visits
          </p>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </button>
      </div>

      <Table containerClassName="min-h-0 flex-1 overflow-y-auto">
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow className="hover:bg-transparent">
            <TableHead>Patient</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Date &amp; Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {APPOINTMENTS.map((appt) => (
            <TableRow key={appt.patient}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback>{appt.initials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium whitespace-nowrap">
                    {appt.patient}
                  </span>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {appt.reason}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {appt.date} · {appt.time}
              </TableCell>
              <TableCell>
                <StatusBadge status={appt.status} variants={STATUS_VARIANT} />
              </TableCell>
              <TableCell className="text-right">
                <button
                  type="button"
                  aria-label="Appointment actions"
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
