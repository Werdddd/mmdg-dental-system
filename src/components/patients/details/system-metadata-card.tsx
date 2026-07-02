import { Settings } from 'lucide-react'

import { StatusBadge } from '@/components/shared/status-badge'
import { InfoCard, InfoRow } from '@/components/patients/details/info-card'
import type {
  RecordStatus,
  SystemMetadata,
} from '@/components/patients/details/data'

const RECORD_STATUS_VARIANTS: Record<
  RecordStatus,
  'success' | 'warning' | 'secondary'
> = {
  Active: 'success',
  Inactive: 'warning',
  Archived: 'secondary',
}

interface SystemMetadataCardProps {
  metadata: SystemMetadata
}

export function SystemMetadataCard({ metadata }: SystemMetadataCardProps) {
  return (
    <InfoCard title="System Metadata" icon={Settings}>
      <InfoRow
        label="Record Status"
        value={
          <StatusBadge
            status={metadata.recordStatus}
            variants={RECORD_STATUS_VARIANTS}
          />
        }
      />
      <InfoRow label="Created By" value={metadata.createdByName} />
      <InfoRow label="Created At" value={metadata.createdAt} />
      <InfoRow label="Updated By" value={metadata.updatedByName} />
      <InfoRow label="Updated At" value={metadata.updatedAt} />
      <InfoRow label="Last Appointment" value={metadata.lastAppointmentDate} />
      <InfoRow label="Next Appointment" value={metadata.nextAppointmentDate} />
    </InfoCard>
  )
}
