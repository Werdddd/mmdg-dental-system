'use client'

import { useState } from 'react'
import { ClipboardList } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SignaturePreview } from '@/components/shared/signature-preview'
import { InfoCard } from '@/components/patients/details/info-card'
import type { PatientMedicalHistoryRow } from '@/lib/data/patient-medical-history'
import {
  ADDITIONAL_QUESTIONS,
  GENERAL_QUESTIONS,
  MEDICAL_CONDITION_CATEGORIES,
  WOMEN_ONLY_QUESTIONS,
  type ConditionResponses,
  type QuestionnaireResponses,
} from '@/lib/dental/medical-history-questions'

function QuestionAnswerRow({
  label,
  responses,
  questionKey,
}: {
  label: string
  responses: QuestionnaireResponses
  questionKey: string
}) {
  const current = responses[questionKey]
  const answerLabel =
    current?.answer === true ? 'Yes' : current?.answer === false ? 'No' : '—'
  return (
    <div className="flex items-start justify-between gap-3 border-b py-2 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">
        <span className="font-medium">{answerLabel}</span>
        {current?.remarks && (
          <span className="block text-xs text-muted-foreground">
            {current.remarks}
          </span>
        )}
      </span>
    </div>
  )
}

function checkedConditionLabels(conditions: ConditionResponses) {
  return MEDICAL_CONDITION_CATEGORIES.flatMap((category) =>
    category.conditions
      .filter((condition) => conditions[condition.key]?.checked)
      .map((condition) => condition.label),
  )
}

interface MedicalHistoryCardProps {
  medicalHistory: PatientMedicalHistoryRow | null
  isFemale: boolean
}

export function MedicalHistoryCard({
  medicalHistory,
  isFemale,
}: MedicalHistoryCardProps) {
  const [open, setOpen] = useState(false)
  const flaggedConditions = medicalHistory
    ? checkedConditionLabels(medicalHistory.conditions)
    : []

  return (
    <InfoCard
      title="Medical History"
      icon={ClipboardList}
      action={
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          View Full Questionnaire
        </Button>
      }
    >
      {!medicalHistory ? (
        <p className="text-sm text-muted-foreground">
          No medical history on file yet.
        </p>
      ) : (
        <>
          <div>
            <p className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Flagged Conditions
            </p>
            {flaggedConditions.length === 0 ? (
              <p className="text-sm text-muted-foreground">None reported.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {flaggedConditions.map((label) => (
                  <Badge key={label} variant="warning">
                    {label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <SignaturePreview
            label="Patient Signature"
            signature={medicalHistory.patientSignature}
            date={medicalHistory.signedAt}
          />
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Medical History Questionnaire</DialogTitle>
            <DialogDescription>
              Full questionnaire responses on file for this patient.
            </DialogDescription>
          </DialogHeader>

          {!medicalHistory ? (
            <p className="text-sm text-muted-foreground">
              No medical history on file yet.
            </p>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  General Questions
                </p>
                {GENERAL_QUESTIONS.map((q) => (
                  <QuestionAnswerRow
                    key={q.key}
                    label={q.label}
                    questionKey={q.key}
                    responses={medicalHistory.generalResponses}
                  />
                ))}
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Medical Conditions
                </p>
                {flaggedConditions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    None reported.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {flaggedConditions.map((label) => (
                      <Badge key={label} variant="warning">
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Additional Medical Questions
                </p>
                {ADDITIONAL_QUESTIONS.map((q) => (
                  <QuestionAnswerRow
                    key={q.key}
                    label={q.label}
                    questionKey={q.key}
                    responses={medicalHistory.additionalResponses}
                  />
                ))}
              </div>

              {isFemale && (
                <div>
                  <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Women Only
                  </p>
                  {WOMEN_ONLY_QUESTIONS.map((q) => (
                    <QuestionAnswerRow
                      key={q.key}
                      label={q.label}
                      questionKey={q.key}
                      responses={medicalHistory.womenOnlyResponses}
                    />
                  ))}
                </div>
              )}

              <SignaturePreview
                label="Patient Signature"
                signature={medicalHistory.patientSignature}
                date={medicalHistory.signedAt}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </InfoCard>
  )
}
