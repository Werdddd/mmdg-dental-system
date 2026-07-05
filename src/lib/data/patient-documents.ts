import { randomUUID } from 'crypto'

import type { SupabaseServerClient } from '@/lib/data/types'
import { formatDisplayDate } from '@/lib/utils'

const BUCKET = 'patient-documents'
const SIGNED_URL_TTL_SECONDS = 60 * 60

export interface PatientDocumentRow {
  id: string
  name: string
  filePath: string
  fileType: string
  fileSize: number
  caption: string
  uploadedByName: string
  createdLabel: string
}

interface PatientDocumentQueryRow {
  id: string
  name: string
  storage_path: string
  file_type: string
  file_size: number
  caption: string
  created_at: string
  uploader: { full_name: string | null } | null
}

const SELECT = `
  id, name, storage_path, file_type, file_size, caption, created_at,
  uploader:profiles ( full_name )
`

function mapRow(row: PatientDocumentQueryRow): PatientDocumentRow {
  return {
    id: row.id,
    name: row.name,
    filePath: row.storage_path,
    fileType: row.file_type,
    fileSize: row.file_size,
    caption: row.caption,
    uploadedByName: row.uploader?.full_name ?? 'Unknown',
    createdLabel: formatDisplayDate(row.created_at.slice(0, 10)),
  }
}

export async function getPatientDocuments(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
): Promise<PatientDocumentRow[]> {
  const { data, error } = await supabase
    .from('patient_documents')
    .select(SELECT)
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return ((data ?? []) as unknown as PatientDocumentQueryRow[]).map(mapRow)
}

function sanitizeExtension(filename: string) {
  const ext = filename.split('.').pop() ?? ''
  const cleaned = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return cleaned.slice(0, 8) || 'bin'
}

export async function uploadPatientDocument(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
  uploadedBy: string | undefined,
  caption: string,
  file: File,
): Promise<void> {
  const path = `${clinicId}/${patientId}/${randomUUID()}.${sanitizeExtension(file.name)}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type })
  if (uploadError) throw uploadError

  const { error } = await supabase.from('patient_documents').insert({
    clinic_id: clinicId,
    patient_id: patientId,
    name: file.name,
    storage_path: path,
    file_type: file.type,
    file_size: file.size,
    caption: caption.trim(),
    uploaded_by: uploadedBy ?? null,
  })
  if (error) throw error
}

export async function deletePatientDocument(
  supabase: SupabaseServerClient,
  documentId: string,
): Promise<void> {
  const { data: row, error: fetchError } = await supabase
    .from('patient_documents')
    .select('storage_path')
    .eq('id', documentId)
    .single()
  if (fetchError) throw fetchError

  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove([row.storage_path])
  if (removeError) throw removeError

  const { error } = await supabase
    .from('patient_documents')
    .delete()
    .eq('id', documentId)
  if (error) throw error
}

export async function signPatientDocumentUrl(
  supabase: SupabaseServerClient,
  path: string,
  downloadName?: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(
      path,
      SIGNED_URL_TTL_SECONDS,
      downloadName ? { download: downloadName } : undefined,
    )
  if (error) throw error
  return data.signedUrl
}
