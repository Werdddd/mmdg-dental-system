import { randomUUID } from 'crypto'

import type { SupabaseServerClient } from '@/lib/data/types'

const BUCKET = 'documents'
const SIGNED_URL_TTL_SECONDS = 60 * 60

export interface DocumentFolderRow {
  id: string
  name: string
  createdAt: string
  documentCount: number
}

export interface DocumentRow {
  id: string
  folderId: string
  name: string
  filePath: string
  fileType: string
  fileSize: number
  uploadedByName: string | null
  createdAt: string
}

function sanitizeExtension(filename: string) {
  const ext = filename.split('.').pop() ?? ''
  const cleaned = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return cleaned.slice(0, 8) || 'bin'
}

export async function getDocumentFolders(
  supabase: SupabaseServerClient,
): Promise<DocumentFolderRow[]> {
  const [
    { data: folders, error: foldersError },
    { data: documents, error: documentsError },
  ] = await Promise.all([
    supabase
      .from('document_folders')
      .select('id, name, created_at')
      .order('name', { ascending: true }),
    supabase.from('documents').select('folder_id'),
  ])
  if (foldersError) throw foldersError
  if (documentsError) throw documentsError

  const countByFolder: Record<string, number> = {}
  for (const doc of documents ?? []) {
    countByFolder[doc.folder_id] = (countByFolder[doc.folder_id] ?? 0) + 1
  }

  return (folders ?? []).map((folder) => ({
    id: folder.id,
    name: folder.name,
    createdAt: folder.created_at,
    documentCount: countByFolder[folder.id] ?? 0,
  }))
}

export async function getFolderById(
  supabase: SupabaseServerClient,
  folderId: string,
): Promise<{ id: string; name: string } | null> {
  const { data, error } = await supabase
    .from('document_folders')
    .select('id, name')
    .eq('id', folderId)
    .maybeSingle()
  if (error) throw error
  return data
}

interface DocumentQueryRow {
  id: string
  folder_id: string
  name: string
  file_path: string
  file_type: string
  file_size: number
  created_at: string
  uploaded_by_profile: { full_name: string | null } | null
}

export async function getDocumentsInFolder(
  supabase: SupabaseServerClient,
  folderId: string,
): Promise<DocumentRow[]> {
  const { data, error } = await supabase
    .from('documents')
    .select(
      `
      id, folder_id, name, file_path, file_type, file_size, created_at,
      uploaded_by_profile:profiles!documents_uploaded_by_fkey ( full_name )
    `,
    )
    .eq('folder_id', folderId)
    .order('created_at', { ascending: false })
  if (error) throw error

  const rows = (data ?? []) as unknown as DocumentQueryRow[]
  return rows.map((doc) => ({
    id: doc.id,
    folderId: doc.folder_id,
    name: doc.name,
    filePath: doc.file_path,
    fileType: doc.file_type,
    fileSize: doc.file_size,
    uploadedByName: doc.uploaded_by_profile?.full_name ?? null,
    createdAt: doc.created_at,
  }))
}

export async function createDocumentFolder(
  supabase: SupabaseServerClient,
  name: string,
  createdBy: string | undefined,
): Promise<void> {
  const { error } = await supabase
    .from('document_folders')
    .insert({ name, created_by: createdBy ?? null })
  if (error) throw error
}

export async function renameDocumentFolder(
  supabase: SupabaseServerClient,
  folderId: string,
  name: string,
): Promise<void> {
  const { error } = await supabase
    .from('document_folders')
    .update({ name })
    .eq('id', folderId)
  if (error) throw error
}

export async function deleteDocumentFolder(
  supabase: SupabaseServerClient,
  folderId: string,
): Promise<void> {
  const { error } = await supabase
    .from('document_folders')
    .delete()
    .eq('id', folderId)
  if (error) throw error
}

export async function deleteDocumentsStorageForFolder(
  supabase: SupabaseServerClient,
  folderId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from('documents')
    .select('file_path')
    .eq('folder_id', folderId)
  if (error) throw error

  const paths = (data ?? []).map((doc) => doc.file_path)
  if (paths.length === 0) return

  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove(paths)
  if (removeError) throw removeError
}

export async function uploadDocument(
  supabase: SupabaseServerClient,
  folderId: string,
  uploadedBy: string | undefined,
  file: File,
): Promise<void> {
  const path = `${folderId}/${randomUUID()}.${sanitizeExtension(file.name)}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type })
  if (uploadError) throw uploadError

  const { error: insertError } = await supabase.from('documents').insert({
    folder_id: folderId,
    name: file.name,
    file_path: path,
    file_type: file.type,
    file_size: file.size,
    uploaded_by: uploadedBy ?? null,
  })
  if (insertError) throw insertError
}

export async function deleteDocument(
  supabase: SupabaseServerClient,
  documentId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', documentId)
    .maybeSingle()
  if (error) throw error
  if (!data) return

  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove([data.file_path])
  if (removeError) throw removeError

  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
  if (deleteError) throw deleteError
}

export async function signDocumentUrl(
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
