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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SignaturePreview } from '@/components/shared/signature-preview'
import { InfoCard } from '@/components/patients/details/info-card'
import { MedicalHistoryEntryDialog } from '@/components/patients/intake/medical-history-entry-dialog'
import type { PatientMedicalHistoryEntry } from '@/lib/data/patient-medical-history'
import type { PatientRow } from '@/components/patients/data'
import { formatDisplayDate } from '@/lib/utils'
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

function entryLabel(entry: PatientMedicalHistoryEntry, index: number) {
  const date = formatDisplayDate(entry.createdAt.slice(0, 10))
  return index === 0 ? `Latest — ${date}` : date
}

function checkedConditionLabels(conditions: ConditionResponses) {
  return MEDICAL_CONDITION_CATEGORIES.flatMap((category) =>
    category.conditions
      .filter((condition) => conditions[condition.key]?.checked)
      .map((condition) => condition.label),
  )
}

interface MedicalHistoryCardProps {
  patientId: string
  firstName: string
  lastName: string
  gender: PatientRow['gender']
  medicalHistoryList: PatientMedicalHistoryEntry[]
  isFemale: boolean
}

export function MedicalHistoryCard({
  patientId,
  firstName,
  lastName,
  gender,
  medicalHistoryList,
  isFemale,
}: MedicalHistoryCardProps) {
  const [entries, setEntries] = useState(medicalHistoryList)
  const [viewOpen, setViewOpen] = useState(false)
  const [newEntryOpen, setNewEntryOpen] = useState(false)
  const [viewIndex, setViewIndex] = useState(0)

  const latest = entries[0] ?? null
  const flaggedConditions = latest
    ? checkedConditionLabels(latest.conditions)
    : []
  const viewed = entries[viewIndex] ?? null
  const viewedFlaggedConditions = viewed
    ? checkedConditionLabels(viewed.conditions)
    : []

  function openViewDialog() {
    setViewIndex(0)
    setViewOpen(true)
  }

  return (
    <InfoCard
      title="Medical History"
      icon={ClipboardList}
      action={
        <div className="flex gap-2">
          {latest && (
            <Button variant="outline" size="sm" onClick={openViewDialog}>
              View Full Questionnaire
            </Button>
          )}
          <Button size="sm" onClick={() => setNewEntryOpen(true)}>
            Fill New Questionnaire
          </Button>
        </div>
      }
    >
      {!latest ? (
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
            signature={latest.patientSignature}
            date={latest.signedAt}
          />
          {entries.length > 1 && (
            <p className="text-xs text-muted-foreground">
              {entries.length} questionnaires on file.
            </p>
          )}
        </>
      )}

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Medical History Questionnaire</DialogTitle>
            <DialogDescription>
              Full questionnaire responses on file for this patient.
            </DialogDescription>
          </DialogHeader>

          {!viewed ? (
            <p className="text-sm text-muted-foreground">
              No medical history on file yet.
            </p>
          ) : (
            <div className="space-y-5">
              {entries.length > 1 && (
                <Select
                  value={String(viewIndex)}
                  onValueChange={(v) => v && setViewIndex(Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a questionnaire">
                      {entryLabel(viewed, viewIndex)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent align="start">
                    {entries.map((entry, index) => (
                      <SelectItem key={entry.id} value={String(index)}>
                        {entryLabel(entry, index)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  General Questions
                </p>
                {GENERAL_QUESTIONS.map((q) => (
                  <QuestionAnswerRow
                    key={q.key}
                    label={q.label}
                    questionKey={q.key}
                    responses={viewed.generalResponses}
                  />
                ))}
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Medical Conditions
                </p>
                {viewedFlaggedConditions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    None reported.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {viewedFlaggedConditions.map((label) => (
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
                    responses={viewed.additionalResponses}
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
                      responses={viewed.womenOnlyResponses}
                    />
                  ))}
                </div>
              )}

              <SignaturePreview
                label="Patient Signature"
                signature={viewed.patientSignature}
                date={viewed.signedAt}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MedicalHistoryEntryDialog
        open={newEntryOpen}
        onOpenChange={setNewEntryOpen}
        patientId={patientId}
        firstName={firstName}
        lastName={lastName}
        gender={gender}
        onSaved={(entry) => setEntries((prev) => [entry, ...prev])}
      />
    </InfoCard>
  )
}
