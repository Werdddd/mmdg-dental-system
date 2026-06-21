import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import { APPOINTMENTS_SUMMARY } from '@/components/appointments/data'

export function AppointmentsSummaryCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Today's Appointments"
        value={String(APPOINTMENTS_SUMMARY.todayCount)}
        icon={CalendarDays}
        helperText="scheduled today"
      />
      <StatCard
        label="Upcoming Appointments"
        value={String(APPOINTMENTS_SUMMARY.upcomingCount)}
        icon={CalendarClock}
        helperText="confirmed or rescheduled"
      />
      <StatCard
        label="Completed Appointments"
        value={String(APPOINTMENTS_SUMMARY.completedCount)}
        icon={CheckCircle2}
        helperText="this period"
      />
      <StatCard
        label="Cancelled Appointments"
        value={String(APPOINTMENTS_SUMMARY.cancelledCount)}
        icon={XCircle}
        helperText="this period"
      />
    </div>
  )
}
