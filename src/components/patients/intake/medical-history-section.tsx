import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { SignaturePad } from '@/components/shared/signature-pad'
import { Field, SectionLabel } from '@/components/patients/intake/form-controls'
import type { PatientIntakeFormValues } from '@/components/patients/intake/types'
import {
  ADDITIONAL_QUESTIONS,
  GENERAL_QUESTIONS,
  MEDICAL_CONDITION_CATEGORIES,
  WOMEN_ONLY_QUESTIONS,
  type ConditionResponses,
  type QuestionnaireResponses,
} from '@/lib/dental/medical-history-questions'
import { cn } from '@/lib/utils'

function YesNoQuestion({
  label,
  responses,
  questionKey,
  onChange,
}: {
  label: string
  responses: QuestionnaireResponses
  questionKey: string
  onChange: (responses: QuestionnaireResponses) => void
}) {
  const current = responses[questionKey] ?? { answer: null, remarks: '' }

  function setAnswer(answer: boolean) {
    onChange({ ...responses, [questionKey]: { ...current, answer } })
  }

  function setRemarks(remarks: string) {
    onChange({ ...responses, [questionKey]: { ...current, remarks } })
  }

  return (
    <div className="space-y-2 border-b pb-3 last:border-b-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm">{label}</p>
        <div className="flex shrink-0 gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={current.answer === true ? 'default' : 'outline'}
            onClick={() => setAnswer(true)}
            className="h-7 px-3"
          >
            Yes
          </Button>
          <Button
            type="button"
            size="sm"
            variant={current.answer === false ? 'default' : 'outline'}
            onClick={() => setAnswer(false)}
            className="h-7 px-3"
          >
            No
          </Button>
        </div>
      </div>
      {current.answer === true && (
        <Input
          value={current.remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Remarks (optional)"
          className="h-8 text-xs"
        />
      )}
    </div>
  )
}

function ConditionCheckbox({
  label,
  conditions,
  conditionKey,
  onChange,
}: {
  label: string
  conditions: ConditionResponses
  conditionKey: string
  onChange: (conditions: ConditionResponses) => void
}) {
  const current = conditions[conditionKey] ?? { checked: false, remarks: '' }

  function toggle(checked: boolean) {
    onChange({ ...conditions, [conditionKey]: { ...current, checked } })
  }

  function setRemarks(remarks: string) {
    onChange({ ...conditions, [conditionKey]: { ...current, remarks } })
  }

  return (
    <div className="space-y-1.5">
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <Checkbox checked={current.checked} onCheckedChange={toggle} />
        {label}
      </label>
      {current.checked && (
        <Input
          value={current.remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Remarks (optional)"
          className="ml-6 h-8 w-[calc(100%-1.5rem)] text-xs"
        />
      )}
    </div>
  )
}

interface MedicalHistorySectionProps {
  values: PatientIntakeFormValues
  onChange: (patch: Partial<PatientIntakeFormValues>) => void
}

export function MedicalHistorySection({
  values,
  onChange,
}: MedicalHistorySectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>General Questions</SectionLabel>
        <div className="mt-3 space-y-3">
          {GENERAL_QUESTIONS.map((q) => (
            <YesNoQuestion
              key={q.key}
              label={q.label}
              questionKey={q.key}
              responses={values.generalResponses}
              onChange={(generalResponses) => onChange({ generalResponses })}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Medical Conditions</SectionLabel>
        <p className="mt-1 text-xs text-muted-foreground">
          Select any conditions that apply. Add remarks where helpful.
        </p>
        <div className="mt-3 space-y-4">
          {MEDICAL_CONDITION_CATEGORIES.map((category) => (
            <div
              key={category.category}
              className={cn('rounded-lg border p-3')}
            >
              <p className="mb-2 text-xs font-semibold text-foreground">
                {category.category}
              </p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {category.conditions.map((condition) => (
                  <ConditionCheckbox
                    key={condition.key}
                    label={condition.label}
                    conditionKey={condition.key}
                    conditions={values.conditions}
                    onChange={(conditions) => onChange({ conditions })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Additional Medical Questions</SectionLabel>
        <div className="mt-3 space-y-3">
          {ADDITIONAL_QUESTIONS.map((q) => (
            <YesNoQuestion
              key={q.key}
              label={q.label}
              questionKey={q.key}
              responses={values.additionalResponses}
              onChange={(additionalResponses) =>
                onChange({ additionalResponses })
              }
            />
          ))}
        </div>
      </div>

      {values.gender === 'Female' && (
        <div>
          <SectionLabel>Women Only</SectionLabel>
          <div className="mt-3 space-y-3">
            {WOMEN_ONLY_QUESTIONS.map((q) => (
              <YesNoQuestion
                key={q.key}
                label={q.label}
                questionKey={q.key}
                responses={values.womenOnlyResponses}
                onChange={(womenOnlyResponses) =>
                  onChange({ womenOnlyResponses })
                }
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionLabel>Declaration</SectionLabel>
        <p className="mt-1 text-xs text-muted-foreground">
          I certify that the above information is accurate to the best of my
          knowledge.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SignaturePad
            label="Patient Signature"
            required
            value={values.medicalHistorySignature}
            onChange={(medicalHistorySignature) =>
              onChange({ medicalHistorySignature })
            }
            nameOptions={[
              `${values.firstName} ${values.lastName}`.trim() || 'Patient',
            ]}
          />
          <Field label="Date Signed">
            <Input
              type="date"
              value={values.medicalHistorySignedAt}
              onChange={(e) =>
                onChange({ medicalHistorySignedAt: e.target.value })
              }
            />
          </Field>
        </div>
      </div>
    </div>
  )
}
