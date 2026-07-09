import type { SupabaseServerClient } from '@/lib/data/types'
import { formatDisplayDate } from '@/lib/utils'
import type { ClinicBranch } from '@/lib/dental/branches'
import { AppError } from '@/lib/errors'

function assertValidCost(cost: number) {
  if (!Number.isFinite(cost) || cost < 0) {
    throw new AppError('Treatment cost must be a positive number.')
  }
}

export type TreatmentRecordStatus = 'Pending' | 'Invoiced' | 'Void'

export interface TreatmentRecordRow {
  id: string
  patientId: string
  patientName: string
  tooth: number | null
  branch: ClinicBranch | null
  treatment: string
  dentistId: string | null
  dentist: string
  clinicId: string
  clinicName: string
  cost: number
  status: TreatmentRecordStatus
  performedAt: string
  notes: string
}

interface TreatmentRecordQueryRow {
  id: string
  patient_id: string
  tooth: number | null
  branch: ClinicBranch | null
  treatment: string
  dentist_id: string | null
  clinic_id: string
  cost: string | number
  status: TreatmentRecordStatus
  performed_at: string
  notes: string | null
  patient: { full_name: string } | null
  dentist: { full_name: string | null } | null
  clinic: { name: string } | null
}

const SELECT = `
  id, patient_id, tooth, branch, treatment, dentist_id, clinic_id, cost, status, performed_at, notes,
  patient:patients ( full_name ),
  dentist:profiles ( full_name ),
  clinic:clinics ( name )
`

function mapRow(row: TreatmentRecordQueryRow): TreatmentRecordRow {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient?.full_name ?? 'Unknown Patient',
    tooth: row.tooth,
    branch: row.branch,
    treatment: row.treatment,
    dentistId: row.dentist_id,
    dentist: row.dentist?.full_name ?? '—',
    clinicId: row.clinic_id,
    clinicName: row.clinic?.name ?? 'Unknown Clinic',
    cost: Number(row.cost),
    status: row.status,
    performedAt: formatDisplayDate(row.performed_at.slice(0, 10)),
    notes: row.notes ?? '',
  }
}

export async function getPendingTreatmentRecords(
  supabase: SupabaseServerClient,
  clinicId: string,
): Promise<TreatmentRecordRow[]> {
  const { data, error } = await supabase
    .from('treatment_records')
    .select(SELECT)
    .eq('clinic_id', clinicId)
    .eq('status', 'Pending')
    .order('performed_at', { ascending: false })

  if (error) throw error
  return ((data ?? []) as unknown as TreatmentRecordQueryRow[]).map(mapRow)
}

// No clinic_id filter — a patient's treatment history spans every clinic
// that has treated them, not just the viewer's own clinic. RLS still
// governs which rows are actually visible.
export async function getTreatmentRecordsForPatient(
  supabase: SupabaseServerClient,
  patientId: string,
): Promise<TreatmentRecordRow[]> {
  const { data, error } = await supabase
    .from('treatment_records')
    .select(SELECT)
    .eq('patient_id', patientId)
    .order('performed_at', { ascending: false })

  if (error) throw error
  return ((data ?? []) as unknown as TreatmentRecordQueryRow[]).map(mapRow)
}

export interface NewTreatmentRecordInput {
  patientId: string
  treatment: string
  dentistId: string | null
  cost: number
  branch?: ClinicBranch | null
  notes?: string
}

export async function createTreatmentRecord(
  supabase: SupabaseServerClient,
  clinicId: string,
  input: NewTreatmentRecordInput,
): Promise<TreatmentRecordRow> {
  assertValidCost(input.cost)

  const { data, error } = await supabase
    .from('treatment_records')
    .insert({
      clinic_id: clinicId,
      patient_id: input.patientId,
      treatment: input.treatment,
      dentist_id: input.dentistId,
      cost: input.cost,
      branch: input.branch ?? null,
      notes: input.notes?.trim() || null,
    })
    .select(SELECT)
    .single()

  if (error) throw error
  return mapRow(data as unknown as TreatmentRecordQueryRow)
}

export interface ToothTreatmentRecordInput {
  patientId: string
  toothRecordId: string
  tooth: number
  treatment: string
  dentistId: string | null
  cost: number
}

export async function createTreatmentRecordForTooth(
  supabase: SupabaseServerClient,
  clinicId: string,
  input: ToothTreatmentRecordInput,
): Promise<void> {
  assertValidCost(input.cost)

  const { error } = await supabase.from('treatment_records').insert({
    clinic_id: clinicId,
    patient_id: input.patientId,
    tooth_record_id: input.toothRecordId,
    tooth: input.tooth,
    treatment: input.treatment,
    dentist_id: input.dentistId,
    cost: input.cost,
  })

  if (error) throw error
}
