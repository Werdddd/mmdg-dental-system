import { Stethoscope } from 'lucide-react'

import { InfoBlock, InfoCard } from '@/components/patients/details/info-card'
import type { ChiefComplaint } from '@/components/patients/details/data'

interface ChiefComplaintCardProps {
  complaint: ChiefComplaint
}

export function ChiefComplaintCard({ complaint }: ChiefComplaintCardProps) {
  return (
    <InfoCard title="Chief Complaint" icon={Stethoscope}>
      <InfoBlock label="Primary Complaint" value={complaint.primaryComplaint} />
      <InfoBlock label="Symptoms" value={complaint.symptoms} />
      <InfoBlock label="Affected Tooth / Area" value={complaint.affectedArea} />
      <InfoBlock label="Additional Remarks" value={complaint.remarks} />
    </InfoCard>
  )
}
