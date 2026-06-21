import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import {
  computeAppointmentsSummary,
  type AppointmentRow,
} from '@/components/appointments/data'

interface AppointmentsSummaryCardsProps {
  appointments: AppointmentRow[]
}

export function AppointmentsSummaryCards({
  appointments,
}: AppointmentsSummaryCardsProps) {
  const summary = computeAppointmentsSummary(appointments)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Today's Appointments"
        value={String(summary.todayCount)}
        icon={CalendarDays}
        helperText="scheduled today"
      />
      <StatCard
        label="Upcoming Appointments"
        value={String(summary.upcomingCount)}
        icon={CalendarClock}
        helperText="confirmed or rescheduled"
      />
      <StatCard
        label="Completed Appointments"
        value={String(summary.completedCount)}
        icon={CheckCircle2}
        helperText="this period"
      />
      <StatCard
        label="Cancelled Appointments"
        value={String(summary.cancelledCount)}
        icon={XCircle}
        helperText="this period"
      />
    </div>
  )
}
