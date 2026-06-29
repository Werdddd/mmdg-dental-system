import { CalendarCheck } from 'lucide-react'

import type { AppointmentRow } from '@/components/appointments/data'

const STATUS_TEXT: Record<string, string> = {
  Scheduled: 'Appointment scheduled',
  Completed: 'Appointment completed',
  'In Progress': 'Appointment in progress',
  Cancelled: 'Appointment cancelled',
  'No Show': 'Patient did not show up',
  Rescheduled: 'Appointment rescheduled',
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hr ago`
  return `${Math.floor(hr / 24)} days ago`
}

interface RecentActivityCardProps {
  appointments: AppointmentRow[]
}

export function RecentActivityCard({ appointments }: RecentActivityCardProps) {
  const items = appointments.slice(0, 4)

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold">Recent Activity</h2>
      <p className="text-sm text-muted-foreground">
        Latest updates across your clinic
      </p>

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">
          No recent appointments yet.
        </p>
      ) : (
        <ul className="mt-5 space-y-5">
          {items.map((appt) => (
            <li key={appt.id} className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalendarCheck className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {STATUS_TEXT[appt.status] ?? 'Appointment updated'} for{' '}
                  {appt.patient.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {appt.dentist.name} · {timeAgo(appt.scheduledAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
