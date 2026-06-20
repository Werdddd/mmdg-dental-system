import { MoreHorizontal } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
  'success' | 'warning' | 'destructive'
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

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Patient</th>
              <th className="px-5 py-3 font-medium">Reason</th>
              <th className="px-5 py-3 font-medium">Date &amp; Time</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {APPOINTMENTS.map((appt) => (
              <tr key={appt.patient} className="hover:bg-muted/40">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback>{appt.initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium whitespace-nowrap">
                      {appt.patient}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                  {appt.reason}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">
                  {appt.date} · {appt.time}
                </td>
                <td className="px-5 py-3.5">
                  <Badge
                    variant={STATUS_VARIANT[appt.status]}
                    className={cn(appt.status === 'Cancelled' && 'opacity-90')}
                  >
                    {appt.status}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    type="button"
                    aria-label="Appointment actions"
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
