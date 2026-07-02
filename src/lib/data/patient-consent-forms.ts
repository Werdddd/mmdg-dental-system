import type { SupabaseServerClient } from '@/lib/data/types'
import type { SignatureValue } from '@/lib/dental/signature'

export interface PatientConsentFormRow {
  clinicName: string
  dentistName: string
  proceduresDescription: string
  disposalClinicName: string
  patientSignature: SignatureValue | null
  patientPrintedName: string
  patientSignedDate: string
  witnessSignature: SignatureValue | null
  witnessPrintedName: string
  witnessSignedDate: string
  guardianSignature: SignatureValue | null
  guardianPrintedName: string
  guardianSignedDate: string
  postOpAckSignature: SignatureValue | null
  postOpAckPrintedName: string
  postOpAckSignedDate: string
}

export type ConsentFormInput = PatientConsentFormRow

interface ConsentFormQueryRow {
  clinic_name: string | null
  dentist_name: string | null
  procedures_description: string | null
  disposal_clinic_name: string | null
  patient_signature_type: 'drawn' | 'typed' | null
  patient_signature_data: string | null
  patient_printed_name: string | null
  patient_signed_date: string | null
  witness_signature_type: 'drawn' | 'typed' | null
  witness_signature_data: string | null
  witness_printed_name: string | null
  witness_signed_date: string | null
  guardian_signature_type: 'drawn' | 'typed' | null
  guardian_signature_data: string | null
  guardian_printed_name: string | null
  guardian_signed_date: string | null
  post_op_ack_signature_type: 'drawn' | 'typed' | null
  post_op_ack_signature_data: string | null
  post_op_ack_printed_name: string | null
  post_op_ack_signed_date: string | null
}

const SELECT = `
  clinic_name, dentist_name, procedures_description, disposal_clinic_name,
  patient_signature_type, patient_signature_data, patient_printed_name, patient_signed_date,
  witness_signature_type, witness_signature_data, witness_printed_name, witness_signed_date,
  guardian_signature_type, guardian_signature_data, guardian_printed_name, guardian_signed_date,
  post_op_ack_signature_type, post_op_ack_signature_data, post_op_ack_printed_name, post_op_ack_signed_date
`

export const EMPTY_CONSENT_FORM: PatientConsentFormRow = {
  clinicName: '',
  dentistName: '',
  proceduresDescription: '',
  disposalClinicName: '',
  patientSignature: null,
  patientPrintedName: '',
  patientSignedDate: '',
  witnessSignature: null,
  witnessPrintedName: '',
  witnessSignedDate: '',
  guardianSignature: null,
  guardianPrintedName: '',
  guardianSignedDate: '',
  postOpAckSignature: null,
  postOpAckPrintedName: '',
  postOpAckSignedDate: '',
}

function mapRow(row: ConsentFormQueryRow): PatientConsentFormRow {
  return {
    clinicName: row.clinic_name ?? '',
    dentistName: row.dentist_name ?? '',
    proceduresDescription: row.procedures_description ?? '',
    disposalClinicName: row.disposal_clinic_name ?? '',
    patientSignature: row.patient_signature_type
      ? {
          type: row.patient_signature_type,
          data: row.patient_signature_data ?? '',
        }
      : null,
    patientPrintedName: row.patient_printed_name ?? '',
    patientSignedDate: row.patient_signed_date ?? '',
    witnessSignature: row.witness_signature_type
      ? {
          type: row.witness_signature_type,
          data: row.witness_signature_data ?? '',
        }
      : null,
    witnessPrintedName: row.witness_printed_name ?? '',
    witnessSignedDate: row.witness_signed_date ?? '',
    guardianSignature: row.guardian_signature_type
      ? {
          type: row.guardian_signature_type,
          data: row.guardian_signature_data ?? '',
        }
      : null,
    guardianPrintedName: row.guardian_printed_name ?? '',
    guardianSignedDate: row.guardian_signed_date ?? '',
    postOpAckSignature: row.post_op_ack_signature_type
      ? {
          type: row.post_op_ack_signature_type,
          data: row.post_op_ack_signature_data ?? '',
        }
      : null,
    postOpAckPrintedName: row.post_op_ack_printed_name ?? '',
    postOpAckSignedDate: row.post_op_ack_signed_date ?? '',
  }
}

export async function getPatientConsentForm(
  supabase: SupabaseServerClient,
  patientId: string,
): Promise<PatientConsentFormRow | null> {
  const { data, error } = await supabase
    .from('patient_consent_forms')
    .select(SELECT)
    .eq('patient_id', patientId)
    .maybeSingle()

  if (error) throw error
  return data ? mapRow(data as unknown as ConsentFormQueryRow) : null
}

export async function upsertPatientConsentForm(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
  profileId: string | undefined,
  input: ConsentFormInput,
): Promise<void> {
  const { data: existing, error: findError } = await supabase
    .from('patient_consent_forms')
    .select('id')
    .eq('patient_id', patientId)
    .maybeSingle()

  if (findError) throw findError

  const payload = {
    clinic_name: input.clinicName || null,
    dentist_name: input.dentistName || null,
    procedures_description: input.proceduresDescription || null,
    disposal_clinic_name: input.disposalClinicName || null,
    patient_signature_type: input.patientSignature?.type ?? null,
    patient_signature_data: input.patientSignature?.data ?? null,
    patient_printed_name: input.patientPrintedName || null,
    patient_signed_date: input.patientSignedDate || null,
    witness_signature_type: input.witnessSignature?.type ?? null,
    witness_signature_data: input.witnessSignature?.data ?? null,
    witness_printed_name: input.witnessPrintedName || null,
    witness_signed_date: input.witnessSignedDate || null,
    guardian_signature_type: input.guardianSignature?.type ?? null,
    guardian_signature_data: input.guardianSignature?.data ?? null,
    guardian_printed_name: input.guardianPrintedName || null,
    guardian_signed_date: input.guardianSignedDate || null,
    post_op_ack_signature_type: input.postOpAckSignature?.type ?? null,
    post_op_ack_signature_data: input.postOpAckSignature?.data ?? null,
    post_op_ack_printed_name: input.postOpAckPrintedName || null,
    post_op_ack_signed_date: input.postOpAckSignedDate || null,
    updated_at: new Date().toISOString(),
    updated_by: profileId ?? null,
  }

  if (existing) {
    const { error } = await supabase
      .from('patient_consent_forms')
      .update(payload)
      .eq('id', existing.id)
    if (error) throw error
    return
  }

  const { error } = await supabase.from('patient_consent_forms').insert({
    clinic_id: clinicId,
    patient_id: patientId,
    created_by: profileId ?? null,
    ...payload,
  })
  if (error) throw error
}
