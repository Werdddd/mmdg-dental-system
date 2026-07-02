import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/patients/intake/form-controls'
import type { PatientIntakeFormValues } from '@/components/patients/intake/types'

interface DentalVisitSectionProps {
  values: PatientIntakeFormValues
  onChange: (patch: Partial<PatientIntakeFormValues>) => void
}

export function DentalVisitSection({
  values,
  onChange,
}: DentalVisitSectionProps) {
  return (
    <div className="space-y-4">
      <Field label="Chief Complaint / Reason for Dental Visit">
        <Textarea
          value={values.chiefComplaint}
          onChange={(e) => onChange({ chiefComplaint: e.target.value })}
          placeholder="Reason for today's visit…"
          className="min-h-[64px] text-sm"
        />
      </Field>
      <Field label="History of Present Illness" optional>
        <Textarea
          value={values.historyOfPresentIllness}
          onChange={(e) =>
            onChange({ historyOfPresentIllness: e.target.value })
          }
          placeholder="Onset, duration, severity, prior treatment…"
          className="min-h-[64px] text-sm"
        />
      </Field>
      <Field label="Initial Clinical Findings" optional>
        <Textarea
          value={values.initialClinicalFindings}
          onChange={(e) =>
            onChange({ initialClinicalFindings: e.target.value })
          }
          placeholder="Findings from the initial exam…"
          className="min-h-[64px] text-sm"
        />
      </Field>
      <Field label="Diagnosis" optional>
        <Textarea
          value={values.diagnosis}
          onChange={(e) => onChange({ diagnosis: e.target.value })}
          placeholder="Clinical diagnosis…"
          className="min-h-[64px] text-sm"
        />
      </Field>
      <Field label="Treatment Recommendation(s)" optional>
        <Textarea
          value={values.treatmentRecommendations}
          onChange={(e) =>
            onChange({ treatmentRecommendations: e.target.value })
          }
          placeholder="Recommended treatment plan…"
          className="min-h-[64px] text-sm"
        />
      </Field>
      <Field label="Notes / Remarks" optional>
        <Textarea
          value={values.complaintRemarks}
          onChange={(e) => onChange({ complaintRemarks: e.target.value })}
          placeholder="Any other observations…"
          className="min-h-[64px] text-sm"
        />
      </Field>
    </div>
  )
}
