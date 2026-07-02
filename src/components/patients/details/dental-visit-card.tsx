import { Stethoscope } from 'lucide-react'

import { InfoBlock, InfoCard } from '@/components/patients/details/info-card'
import type { DentalVisitInfo } from '@/components/patients/details/data'

interface DentalVisitCardProps {
  visit: DentalVisitInfo
}

export function DentalVisitCard({ visit }: DentalVisitCardProps) {
  return (
    <InfoCard title="Dental Visit Information" icon={Stethoscope}>
      <InfoBlock
        label="Chief Complaint / Reason for Visit"
        value={visit.chiefComplaint}
      />
      <InfoBlock
        label="History of Present Illness"
        value={visit.historyOfPresentIllness}
      />
      <InfoBlock
        label="Initial Clinical Findings"
        value={visit.initialClinicalFindings}
      />
      <InfoBlock label="Diagnosis" value={visit.diagnosis} />
      <InfoBlock
        label="Treatment Recommendation(s)"
        value={visit.treatmentRecommendations}
      />
      <InfoBlock label="Notes / Remarks" value={visit.remarks} />
    </InfoCard>
  )
}
