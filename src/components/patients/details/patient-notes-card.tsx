import { NotebookPen } from 'lucide-react'

import { InfoBlock, InfoCard } from '@/components/patients/details/info-card'
import type { PatientNotes } from '@/components/patients/details/data'

interface PatientNotesCardProps {
  notes: PatientNotes
}

export function PatientNotesCard({ notes }: PatientNotesCardProps) {
  return (
    <InfoCard title="Notes" icon={NotebookPen}>
      <InfoBlock label="Dentist Notes" value={notes.dentistNotes} />
      <InfoBlock label="Treatment Reminders" value={notes.treatmentReminders} />
      <InfoBlock
        label="Follow-up Instructions"
        value={notes.followUpInstructions}
      />
    </InfoCard>
  )
}
