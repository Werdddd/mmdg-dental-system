import type { SupabaseServerClient } from '@/lib/data/types'
import type { SignatureValue } from '@/lib/dental/signature'

export interface PatientRadiographConsentRow {
  cbct: boolean
  panoramic: boolean
  pfm: boolean
  dentistName: string
  patientSignature: SignatureValue | null
  witnessSignature: SignatureValue | null
  witnessPrintedName: string
  signedDate: string
}

export type RadiographConsentInput = PatientRadiographConsentRow

interface RadiographConsentQueryRow {
  radiograph_cbct: boolean
  radiograph_panoramic: boolean
  radiograph_pfm: boolean
  dentist_name: string | null
  patient_signature_type: 'drawn' | 'typed' | null
  patient_signature_data: string | null
  witness_signature_type: 'drawn' | 'typed' | null
  witness_signature_data: string | null
  witness_printed_name: string | null
  signed_date: string | null
}

const SELECT = `
  radiograph_cbct, radiograph_panoramic, radiograph_pfm, dentist_name,
  patient_signature_type, patient_signature_data,
  witness_signature_type, witness_signature_data, witness_printed_name,
  signed_date
`

export const EMPTY_RADIOGRAPH_CONSENT: PatientRadiographConsentRow = {
  cbct: false,
  panoramic: false,
  pfm: false,
  dentistName: '',
  patientSignature: null,
  witnessSignature: null,
  witnessPrintedName: '',
  signedDate: '',
}

function mapRow(row: RadiographConsentQueryRow): PatientRadiographConsentRow {
  return {
    cbct: row.radiograph_cbct,
    panoramic: row.radiograph_panoramic,
    pfm: row.radiograph_pfm,
    dentistName: row.dentist_name ?? '',
    patientSignature: row.patient_signature_type
      ? {
          type: row.patient_signature_type,
          data: row.patient_signature_data ?? '',
        }
      : null,
    witnessSignature: row.witness_signature_type
      ? {
          type: row.witness_signature_type,
          data: row.witness_signature_data ?? '',
        }
      : null,
    witnessPrintedName: row.witness_printed_name ?? '',
    signedDate: row.signed_date ?? '',
  }
}

export async function getPatientRadiographConsent(
  supabase: SupabaseServerClient,
  patientId: string,
): Promise<PatientRadiographConsentRow | null> {
  const { data, error } = await supabase
    .from('patient_radiograph_consents')
    .select(SELECT)
    .eq('patient_id', patientId)
    .maybeSingle()

  if (error) throw error
  return data ? mapRow(data as unknown as RadiographConsentQueryRow) : null
}

export async function upsertPatientRadiographConsent(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
  profileId: string | undefined,
  input: RadiographConsentInput,
): Promise<void> {
  const { data: existing, error: findError } = await supabase
    .from('patient_radiograph_consents')
    .select('id')
    .eq('patient_id', patientId)
    .maybeSingle()

  if (findError) throw findError

  const payload = {
    radiograph_cbct: input.cbct,
    radiograph_panoramic: input.panoramic,
    radiograph_pfm: input.pfm,
    dentist_name: input.dentistName || null,
    patient_signature_type: input.patientSignature?.type ?? null,
    patient_signature_data: input.patientSignature?.data ?? null,
    witness_signature_type: input.witnessSignature?.type ?? null,
    witness_signature_data: input.witnessSignature?.data ?? null,
    witness_printed_name: input.witnessPrintedName || null,
    signed_date: input.signedDate || null,
    updated_at: new Date().toISOString(),
    updated_by: profileId ?? null,
  }

  if (existing) {
    const { error } = await supabase
      .from('patient_radiograph_consents')
      .update(payload)
      .eq('id', existing.id)
    if (error) throw error
    return
  }

  const { error } = await supabase.from('patient_radiograph_consents').insert({
    clinic_id: clinicId,
    patient_id: patientId,
    created_by: profileId ?? null,
    ...payload,
  })
  if (error) throw error
}
