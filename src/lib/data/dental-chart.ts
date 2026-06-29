import type { SupabaseServerClient } from '@/lib/data/types'
import { formatDisplayDate } from '@/lib/utils'
import type { ToothCondition } from '@/lib/dental/teeth'
import { createTreatmentRecordForTooth } from '@/lib/data/treatment-records'

export interface ToothRecord {
  tooth: number
  condition: ToothCondition
  treatmentPerformed: string
  notes: string
  lastUpdated: string
  dentistId: string | null
  dentist: string
}

interface ToothRecordRow {
  tooth: number
  condition: ToothCondition
  treatment_performed: string | null
  notes: string | null
  updated_at: string
  dentist_id: string | null
  dentist: { full_name: string | null } | null
}

const SELECT = `
  tooth, condition, treatment_performed, notes, updated_at, dentist_id,
  dentist:profiles ( full_name )
`

function emptyRecord(tooth: number): ToothRecord {
  return {
    tooth,
    condition: 'Healthy',
    treatmentPerformed: '—',
    notes: '',
    lastUpdated: '—',
    dentistId: null,
    dentist: '—',
  }
}

export async function getToothRecords(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
): Promise<ToothRecord[]> {
  const { data, error } = await supabase
    .from('tooth_records')
    .select(SELECT)
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)

  if (error) throw error

  const byTooth = new Map<number, ToothRecordRow>()
  for (const row of (data ?? []) as unknown as ToothRecordRow[]) {
    byTooth.set(row.tooth, row)
  }

  return Array.from({ length: 32 }, (_, i) => {
    const tooth = i + 1
    const row = byTooth.get(tooth)
    if (!row) return emptyRecord(tooth)

    return {
      tooth,
      condition: row.condition,
      treatmentPerformed: row.treatment_performed || '—',
      notes: row.notes ?? '',
      lastUpdated: formatDisplayDate(row.updated_at.slice(0, 10)),
      dentistId: row.dentist_id,
      dentist: row.dentist?.full_name ?? '—',
    }
  })
}

export interface ToothRecordInput {
  condition: ToothCondition
  treatmentPerformed: string
  notes: string
  dentistId: string | null
  cost?: number
}

export async function upsertToothRecord(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
  tooth: number,
  input: ToothRecordInput,
): Promise<void> {
  const { data, error } = await supabase
    .from('tooth_records')
    .upsert(
      {
        clinic_id: clinicId,
        patient_id: patientId,
        tooth,
        condition: input.condition,
        treatment_performed: input.treatmentPerformed.trim() || null,
        notes: input.notes.trim() || null,
        dentist_id: input.dentistId || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'patient_id,tooth' },
    )
    .select('id')
    .single()

  if (error) throw error

  const treatment = input.treatmentPerformed.trim()
  if (input.cost && input.cost > 0 && treatment) {
    await createTreatmentRecordForTooth(supabase, clinicId, {
      patientId,
      toothRecordId: data.id,
      tooth,
      treatment,
      dentistId: input.dentistId || null,
      cost: input.cost,
    })
  }
}
