'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/profile'
import { AppError, toActionErrorMessage } from '@/lib/errors'
import {
  createDocumentFolder,
  deleteDocument,
  deleteDocumentFolder,
  deleteDocumentsStorageForFolder,
  renameDocumentFolder,
  signDocumentUrl,
  uploadDocument,
} from '@/lib/data/documents'

type ActionResult = { error?: string }

const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
])

async function assertAdmin() {
  const profile = await getCurrentProfile()
  if (profile?.role !== 'superadmin' && profile?.role !== 'admin') {
    throw new AppError('Unauthorized')
  }
  return profile
}

export async function createFolderAction(name: string): Promise<ActionResult> {
  try {
    const profile = await assertAdmin()
    const trimmed = name.trim()
    if (!trimmed) throw new AppError('Folder name is required.')
    const supabase = await createClient()
    await createDocumentFolder(supabase, trimmed, profile?.id)
    revalidatePath('/documents')
    return {}
  } catch (e) {
    return { error: toActionErrorMessage(e) }
  }
}

export async function renameFolderAction(
  folderId: string,
  name: string,
): Promise<ActionResult> {
  try {
    await assertAdmin()
    const trimmed = name.trim()
    if (!trimmed) throw new AppError('Folder name is required.')
    const supabase = await createClient()
    await renameDocumentFolder(supabase, folderId, trimmed)
    revalidatePath('/documents')
    revalidatePath(`/documents/${folderId}`)
    return {}
  } catch (e) {
    return { error: toActionErrorMessage(e) }
  }
}

export async function deleteFolderAction(
  folderId: string,
): Promise<ActionResult> {
  try {
    await assertAdmin()
    const supabase = await createClient()
    await deleteDocumentsStorageForFolder(supabase, folderId)
    await deleteDocumentFolder(supabase, folderId)
    revalidatePath('/documents')
    return {}
  } catch (e) {
    return { error: toActionErrorMessage(e) }
  }
}

export async function uploadDocumentAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const profile = await assertAdmin()
    const folderId = String(formData.get('folderId') ?? '')
    const file = formData.get('file')

    if (!folderId || !(file instanceof File) || file.size === 0) {
      throw new AppError('A folder and a file are required.')
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new AppError('Unsupported file type.')
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      throw new AppError('File must be smaller than 20MB.')
    }

    const supabase = await createClient()
    await uploadDocument(supabase, folderId, profile?.id, file)
    revalidatePath(`/documents/${folderId}`)
    return {}
  } catch (e) {
    return { error: toActionErrorMessage(e) }
  }
}

export async function deleteDocumentAction(
  documentId: string,
  folderId: string,
): Promise<ActionResult> {
  try {
    await assertAdmin()
    const supabase = await createClient()
    await deleteDocument(supabase, documentId)
    revalidatePath(`/documents/${folderId}`)
    return {}
  } catch (e) {
    return { error: toActionErrorMessage(e) }
  }
}

export async function getDocumentUrlAction(
  filePath: string,
  downloadName?: string,
): Promise<{ url?: string; error?: string }> {
  try {
    const profile = await getCurrentProfile()
    if (!profile) throw new AppError('Unauthorized')
    const supabase = await createClient()
    const url = await signDocumentUrl(supabase, filePath, downloadName)
    return { url }
  } catch (e) {
    return { error: toActionErrorMessage(e) }
  }
}
