import type { SupabaseServerClient } from '@/lib/data/types'
import { formatDisplayDate } from '@/lib/utils'

export interface PatientNoteEntry {
  id: string
  content: string
  authorName: string
  createdAt: string
  updatedAt: string
  createdLabel: string
  edited: boolean
}

interface PatientNoteQueryRow {
  id: string
  content: string
  created_at: string
  updated_at: string
  author: { full_name: string | null } | null
}

const SELECT = `
  id, content, created_at, updated_at,
  author:profiles ( full_name )
`

function mapNoteRow(row: PatientNoteQueryRow): PatientNoteEntry {
  return {
    id: row.id,
    content: row.content,
    authorName: row.author?.full_name ?? 'Unknown',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdLabel: formatDisplayDate(row.created_at.slice(0, 10)),
    edited: row.updated_at !== row.created_at,
  }
}

export async function getPatientNotes(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
): Promise<PatientNoteEntry[]> {
  const { data, error } = await supabase
    .from('patient_notes')
    .select(SELECT)
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return ((data ?? []) as unknown as PatientNoteQueryRow[]).map(mapNoteRow)
}

export async function createPatientNote(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
  authorId: string | undefined,
  content: string,
): Promise<PatientNoteEntry> {
  const { data, error } = await supabase
    .from('patient_notes')
    .insert({
      clinic_id: clinicId,
      patient_id: patientId,
      author_id: authorId ?? null,
      content,
    })
    .select(SELECT)
    .single()

  if (error) throw error
  return mapNoteRow(data as unknown as PatientNoteQueryRow)
}

export async function updatePatientNote(
  supabase: SupabaseServerClient,
  noteId: string,
  content: string,
): Promise<PatientNoteEntry> {
  const { data, error } = await supabase
    .from('patient_notes')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', noteId)
    .select(SELECT)
    .single()

  if (error) throw error
  return mapNoteRow(data as unknown as PatientNoteQueryRow)
}

export async function deletePatientNote(
  supabase: SupabaseServerClient,
  noteId: string,
): Promise<void> {
  const { error } = await supabase
    .from('patient_notes')
    .delete()
    .eq('id', noteId)
  if (error) throw error
}
