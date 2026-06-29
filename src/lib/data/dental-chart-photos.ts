import { randomUUID } from 'crypto'

import type { SupabaseServerClient } from '@/lib/data/types'
import { formatDisplayDate } from '@/lib/utils'

const BUCKET = 'dental-chart-photos'
const SIGNED_URL_TTL_SECONDS = 60 * 60

export interface ToothPhoto {
  id: string
  tooth: number | null
  url: string
  caption: string
  uploadedBy: string
  createdLabel: string
}

interface ToothPhotoRow {
  id: string
  tooth: number | null
  storage_path: string
  caption: string | null
  created_at: string
  uploader: { full_name: string | null } | null
}

const SELECT = `
  id, tooth, storage_path, caption, created_at,
  uploader:profiles ( full_name )
`

export async function getToothPhotos(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
): Promise<ToothPhoto[]> {
  const { data, error } = await supabase
    .from('dental_chart_photos')
    .select(SELECT)
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const rows = (data ?? []) as unknown as ToothPhotoRow[]
  if (rows.length === 0) return []

  const { data: signed, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(
      rows.map((row) => row.storage_path),
      SIGNED_URL_TTL_SECONDS,
    )
  if (signError) throw signError

  return rows.map((row, i) => ({
    id: row.id,
    tooth: row.tooth,
    url: signed?.[i]?.signedUrl ?? '',
    caption: row.caption ?? '',
    uploadedBy: row.uploader?.full_name ?? 'Unknown',
    createdLabel: formatDisplayDate(row.created_at.slice(0, 10)),
  }))
}

function sanitizeExtension(filename: string) {
  const ext = filename.split('.').pop() ?? ''
  const cleaned = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return cleaned.slice(0, 8) || 'jpg'
}

export async function addToothPhoto(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
  uploadedBy: string | undefined,
  tooth: number | null,
  caption: string,
  file: File,
): Promise<void> {
  const path = `${clinicId}/${patientId}/${randomUUID()}.${sanitizeExtension(file.name)}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type })
  if (uploadError) throw uploadError

  const { error } = await supabase.from('dental_chart_photos').insert({
    clinic_id: clinicId,
    patient_id: patientId,
    tooth,
    storage_path: path,
    caption: caption.trim() || null,
    uploaded_by: uploadedBy ?? null,
  })
  if (error) throw error
}

export async function deleteToothPhoto(
  supabase: SupabaseServerClient,
  photoId: string,
): Promise<void> {
  const { data: row, error: fetchError } = await supabase
    .from('dental_chart_photos')
    .select('storage_path')
    .eq('id', photoId)
    .single()
  if (fetchError) throw fetchError

  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove([row.storage_path])
  if (removeError) throw removeError

  const { error } = await supabase
    .from('dental_chart_photos')
    .delete()
    .eq('id', photoId)
  if (error) throw error
}
