import { Cake, HeartPulse, UserPlus, Users } from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import { PATIENTS_SUMMARY } from '@/components/patients/data'

export function PatientsSummaryCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Patients"
        value={String(PATIENTS_SUMMARY.totalPatients)}
        icon={Users}
        helperText="registered at your clinic"
      />
      <StatCard
        label="New This Month"
        value={String(PATIENTS_SUMMARY.newThisMonth)}
        icon={UserPlus}
        helperText="newly registered"
      />
      <StatCard
        label="Active Treatments"
        value={String(PATIENTS_SUMMARY.activeTreatments)}
        icon={HeartPulse}
        helperText="ongoing care plans"
      />
      <StatCard
        label="Upcoming Birthdays"
        value={String(PATIENTS_SUMMARY.upcomingBirthdays)}
        icon={Cake}
        helperText="within 30 days"
      />
    </div>
  )
}
