import type { SponsorRow } from '@/lib/data/sponsors'

function isThisMonth(dateStr: string, referenceDate: Date) {
  const parsed = new Date(dateStr)
  return (
    parsed.getMonth() === referenceDate.getMonth() &&
    parsed.getFullYear() === referenceDate.getFullYear()
  )
}

export function computeSponsorsSummary(sponsors: SponsorRow[]) {
  const referenceDate = new Date()
  const totalPatientsCovered = sponsors.reduce(
    (sum, sponsor) => sum + sponsor.patientsCovered,
    0,
  )
  const avgCoverage =
    sponsors.length === 0
      ? 0
      : Math.round(
          sponsors.reduce(
            (sum, sponsor) => sum + sponsor.defaultCoveragePercentage,
            0,
          ) / sponsors.length,
        )

  return {
    totalSponsors: sponsors.length,
    totalPatientsCovered,
    avgCoverage,
    newThisMonth: sponsors.filter((sponsor) =>
      isThisMonth(sponsor.createdAt, referenceDate),
    ).length,
  }
}
