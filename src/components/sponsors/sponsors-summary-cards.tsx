import { Heart, HeartHandshake, Percent, Users } from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import { computeSponsorsSummary } from '@/components/sponsors/data'
import type { SponsorRow } from '@/lib/data/sponsors'

interface SponsorsSummaryCardsProps {
  sponsors: SponsorRow[]
}

export function SponsorsSummaryCards({ sponsors }: SponsorsSummaryCardsProps) {
  const summary = computeSponsorsSummary(sponsors)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Sponsors"
        value={String(summary.totalSponsors)}
        icon={HeartHandshake}
        helperText="sponsor organizations"
      />
      <StatCard
        label="Patients Covered"
        value={String(summary.totalPatientsCovered)}
        icon={Users}
        helperText="currently sponsored"
      />
      <StatCard
        label="Average Coverage"
        value={`${summary.avgCoverage}%`}
        icon={Percent}
        helperText="default coverage rate"
      />
      <StatCard
        label="New This Month"
        value={String(summary.newThisMonth)}
        icon={Heart}
        helperText="sponsors added"
      />
    </div>
  )
}
