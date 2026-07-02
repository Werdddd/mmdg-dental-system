import { randomUUID } from 'crypto'

import type { SupabaseServerClient } from '@/lib/data/types'

const BUCKET = 'patient-photos'
const SIGNED_URL_TTL_SECONDS = 60 * 60

function sanitizeExtension(filename: string) {
  const ext = filename.split('.').pop() ?? ''
  const cleaned = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return cleaned.slice(0, 8) || 'jpg'
}

export async function uploadPatientPhoto(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
  file: File,
): Promise<string> {
  const path = `${clinicId}/${patientId}/${randomUUID()}.${sanitizeExtension(file.name)}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type })
  if (error) throw error

  return path
}

export async function deletePatientPhoto(
  supabase: SupabaseServerClient,
  path: string,
): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}

export async function signPatientPhotoUrl(
  supabase: SupabaseServerClient,
  path: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
  if (error) throw error
  return data.signedUrl
}

// Batch-signs every non-null path so list views (many patients at once)
// only make one Storage request instead of one per row.
export async function signPatientPhotoUrls(
  supabase: SupabaseServerClient,
  paths: (string | null)[],
): Promise<Map<string, string>> {
  const uniquePaths = [...new Set(paths.filter((p): p is string => p != null))]
  if (uniquePaths.length === 0) return new Map()

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(uniquePaths, SIGNED_URL_TTL_SECONDS)
  if (error) throw error

  const map = new Map<string, string>()
  data.forEach((signed, i) => {
    if (signed.signedUrl) map.set(uniquePaths[i], signed.signedUrl)
  })
  return map
}
