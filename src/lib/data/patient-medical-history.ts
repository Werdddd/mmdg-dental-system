import type { SupabaseServerClient } from '@/lib/data/types'
import type {
  ConditionResponses,
  QuestionnaireResponses,
} from '@/lib/dental/medical-history-questions'
import type { SignatureValue } from '@/lib/dental/signature'

export interface PatientMedicalHistoryRow {
  generalResponses: QuestionnaireResponses
  additionalResponses: QuestionnaireResponses
  womenOnlyResponses: QuestionnaireResponses
  conditions: ConditionResponses
  patientSignature: SignatureValue | null
  signedAt: string
}

export interface MedicalHistoryInput {
  generalResponses: QuestionnaireResponses
  additionalResponses: QuestionnaireResponses
  womenOnlyResponses: QuestionnaireResponses
  conditions: ConditionResponses
  patientSignature: SignatureValue | null
  signedAt: string
}

interface MedicalHistoryQueryRow {
  general_responses: QuestionnaireResponses | null
  additional_responses: QuestionnaireResponses | null
  women_only_responses: QuestionnaireResponses | null
  conditions: ConditionResponses | null
  patient_signature_type: 'drawn' | 'typed' | null
  patient_signature_data: string | null
  signed_at: string | null
}

const SELECT = `
  general_responses, additional_responses, women_only_responses, conditions,
  patient_signature_type, patient_signature_data, signed_at
`

export const EMPTY_MEDICAL_HISTORY: PatientMedicalHistoryRow = {
  generalResponses: {},
  additionalResponses: {},
  womenOnlyResponses: {},
  conditions: {},
  patientSignature: null,
  signedAt: '',
}

function mapRow(row: MedicalHistoryQueryRow): PatientMedicalHistoryRow {
  return {
    generalResponses: row.general_responses ?? {},
    additionalResponses: row.additional_responses ?? {},
    womenOnlyResponses: row.women_only_responses ?? {},
    conditions: row.conditions ?? {},
    patientSignature: row.patient_signature_type
      ? {
          type: row.patient_signature_type,
          data: row.patient_signature_data ?? '',
        }
      : null,
    signedAt: row.signed_at ?? '',
  }
}

export async function getPatientMedicalHistory(
  supabase: SupabaseServerClient,
  patientId: string,
): Promise<PatientMedicalHistoryRow | null> {
  const { data, error } = await supabase
    .from('patient_medical_history')
    .select(SELECT)
    .eq('patient_id', patientId)
    .maybeSingle()

  if (error) throw error
  return data ? mapRow(data as unknown as MedicalHistoryQueryRow) : null
}

export async function upsertPatientMedicalHistory(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
  profileId: string | undefined,
  input: MedicalHistoryInput,
): Promise<void> {
  const { data: existing, error: findError } = await supabase
    .from('patient_medical_history')
    .select('id')
    .eq('patient_id', patientId)
    .maybeSingle()

  if (findError) throw findError

  const payload = {
    general_responses: input.generalResponses,
    additional_responses: input.additionalResponses,
    women_only_responses: input.womenOnlyResponses,
    conditions: input.conditions,
    patient_signature_type: input.patientSignature?.type ?? null,
    patient_signature_data: input.patientSignature?.data ?? null,
    signed_at: input.signedAt || null,
    updated_at: new Date().toISOString(),
    updated_by: profileId ?? null,
  }

  if (existing) {
    const { error } = await supabase
      .from('patient_medical_history')
      .update(payload)
      .eq('id', existing.id)
    if (error) throw error
    return
  }

  const { error } = await supabase.from('patient_medical_history').insert({
    clinic_id: clinicId,
    patient_id: patientId,
    created_by: profileId ?? null,
    ...payload,
  })
  if (error) throw error
}
