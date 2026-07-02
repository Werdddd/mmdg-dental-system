import { Banknote, CalendarDays, UserCog, Users } from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import { formatCurrency } from '@/lib/utils'

interface ClinicSummaryCardsProps {
  totalRevenue: number
  totalPatients: number
  totalAppointments: number
  totalStaff: number
}

export function ClinicSummaryCards({
  totalRevenue,
  totalPatients,
  totalAppointments,
  totalStaff,
}: ClinicSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Revenue"
        value={formatCurrency(totalRevenue)}
        icon={Banknote}
        helperText="collected to date"
      />
      <StatCard
        label="Total Patients"
        value={String(totalPatients)}
        icon={Users}
        helperText="registered at this clinic"
      />
      <StatCard
        label="Total Appointments"
        value={String(totalAppointments)}
        icon={CalendarDays}
        helperText="booked at this clinic"
      />
      <StatCard
        label="Total Staff"
        value={String(totalStaff)}
        icon={UserCog}
        helperText="assigned to this clinic"
      />
    </div>
  )
}
