import { UserRound } from 'lucide-react'

import { InfoCard, InfoRow } from '@/components/patients/details/info-card'
import type { PatientAbout } from '@/components/patients/details/data'

interface PatientAboutCardProps {
  about: PatientAbout
}

export function PatientAboutCard({ about }: PatientAboutCardProps) {
  return (
    <InfoCard title="About" icon={UserRound}>
      <InfoRow label="Date of Birth" value={about.dateOfBirth} />
      <InfoRow label="Age" value={`${about.age} years old`} />
      <InfoRow label="Sex" value={about.gender} />
      <InfoRow label="Civil Status" value={about.civilStatus} />
      <InfoRow label="Nationality" value={about.nationality} />
      <InfoRow label="Occupation" value={about.occupation} />
      <InfoRow label="Home Address" value={about.homeAddress} />
      <InfoRow label="Mobile Number" value={about.contactNumber} />
      <InfoRow label="Telephone Number" value={about.telephoneNumber} />
      <InfoRow label="Preferred Contact" value={about.preferredContactMethod} />
      <InfoRow label="Email" value={about.email} />
      <InfoRow
        label="Emergency Contact"
        value={
          <span className="block">
            <span className="block">
              {about.emergencyContact.name} · {about.emergencyContact.relation}
            </span>
            <span className="block text-xs font-normal text-muted-foreground">
              {about.emergencyContact.phone}
            </span>
          </span>
        }
      />
    </InfoCard>
  )
}
