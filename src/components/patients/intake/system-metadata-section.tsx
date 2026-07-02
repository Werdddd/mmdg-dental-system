import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RecordStatus, SystemMetadata } from '@/components/patients/data'
import { Field, SectionLabel } from '@/components/patients/intake/form-controls'
import type { PatientIntakeFormValues } from '@/components/patients/intake/types'

const RECORD_STATUSES: RecordStatus[] = ['Active', 'Inactive', 'Archived']

interface SystemMetadataSectionProps {
  values: PatientIntakeFormValues
  onChange: (patch: Partial<PatientIntakeFormValues>) => void
  readOnlyMetadata?: SystemMetadata
}

export function SystemMetadataSection({
  values,
  onChange,
  readOnlyMetadata,
}: SystemMetadataSectionProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <Field label="Record Status">
          <Select
            value={values.recordStatus}
            onValueChange={(value) =>
              value && onChange({ recordStatus: value as RecordStatus })
            }
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECORD_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {readOnlyMetadata && (
        <div className="space-y-3">
          <SectionLabel>Record History</SectionLabel>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 rounded-lg border bg-muted/30 p-4 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-2 sm:block">
              <dt className="text-muted-foreground">Created By</dt>
              <dd className="font-medium">{readOnlyMetadata.createdByName}</dd>
            </div>
            <div className="flex justify-between gap-2 sm:block">
              <dt className="text-muted-foreground">Created At</dt>
              <dd className="font-medium">{readOnlyMetadata.createdAt}</dd>
            </div>
            <div className="flex justify-between gap-2 sm:block">
              <dt className="text-muted-foreground">Updated By</dt>
              <dd className="font-medium">{readOnlyMetadata.updatedByName}</dd>
            </div>
            <div className="flex justify-between gap-2 sm:block">
              <dt className="text-muted-foreground">Updated At</dt>
              <dd className="font-medium">{readOnlyMetadata.updatedAt}</dd>
            </div>
            <div className="flex justify-between gap-2 sm:block">
              <dt className="text-muted-foreground">Last Appointment</dt>
              <dd className="font-medium">
                {readOnlyMetadata.lastAppointmentDate}
              </dd>
            </div>
            <div className="flex justify-between gap-2 sm:block">
              <dt className="text-muted-foreground">Next Appointment</dt>
              <dd className="font-medium">
                {readOnlyMetadata.nextAppointmentDate}
              </dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground">
            Patient Notes are managed separately from the Notes card on the
            patient&apos;s detail page.
          </p>
        </div>
      )}
    </div>
  )
}
