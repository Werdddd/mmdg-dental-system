import { Cake, HeartPulse, UserPlus, Users } from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import {
  computePatientsSummary,
  type PatientRow,
} from '@/components/patients/data'

interface PatientsSummaryCardsProps {
  patients: PatientRow[]
}

export function PatientsSummaryCards({ patients }: PatientsSummaryCardsProps) {
  const summary = computePatientsSummary(patients)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Patients"
        value={String(summary.totalPatients)}
        icon={Users}
        helperText="registered at your clinic"
      />
      <StatCard
        label="New This Month"
        value={String(summary.newThisMonth)}
        icon={UserPlus}
        helperText="newly registered"
      />
      <StatCard
        label="Active Treatments"
        value={String(summary.activeTreatments)}
        icon={HeartPulse}
        helperText="ongoing care plans"
      />
      <StatCard
        label="Upcoming Birthdays"
        value={String(summary.upcomingBirthdays)}
        icon={Cake}
        helperText="within 30 days"
      />
    </div>
  )
}
