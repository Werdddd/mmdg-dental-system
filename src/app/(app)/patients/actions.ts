'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { getCurrentProfile } from '@/lib/auth/profile'
import {
  createPatient,
  updatePatient,
  type NewPatientInput,
  type UpdatePatientInput,
} from '@/lib/data/patients'
import {
  createPatientNote,
  updatePatientNote,
  deletePatientNote,
} from '@/lib/data/patient-notes'
import {
  upsertToothRecord,
  type ToothRecordInput,
} from '@/lib/data/dental-chart'
import {
  addPatientBranch,
  removePatientBranch,
} from '@/lib/data/patient-branches'
import { addToothPhoto, deleteToothPhoto } from '@/lib/data/dental-chart-photos'
import {
  createTreatmentRecord,
  type NewTreatmentRecordInput,
} from '@/lib/data/treatment-records'
import {
  deletePatientDocument,
  signPatientDocumentUrl,
  uploadPatientDocument,
} from '@/lib/data/patient-documents'
import {
  upsertPatientRadiographConsent,
  type RadiographConsentInput,
} from '@/lib/data/patient-radiograph-consents'
import type { ClinicBranch } from '@/lib/dental/branches'
import { AppError, toActionErrorMessage } from '@/lib/errors'

export async function addPatientAction(
  input: NewPatientInput,
  photoFile?: File | null,
) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const profile = await getCurrentProfile()
  const patient = await createPatient(
    supabase,
    clinicId,
    profile?.id,
    input,
    photoFile,
  )
  revalidatePath('/patients')
  return patient
}

export async function updatePatientAction(
  patientId: string,
  input: UpdatePatientInput,
  photoFile?: File | null,
  removePhoto?: boolean,
) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const profile = await getCurrentProfile()
  const patient = await updatePatient(
    supabase,
    clinicId,
    patientId,
    profile?.id,
    input,
    photoFile,
    removePhoto,
  )
  revalidatePath('/patients')
  revalidatePath(`/patients/${patientId}`)
  revalidatePath(`/patients/${patientId}/edit`)
  return patient
}

export async function addPatientNoteAction(patientId: string, content: string) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const profile = await getCurrentProfile()
  const note = await createPatientNote(
    supabase,
    clinicId,
    patientId,
    profile?.id,
    content,
  )
  revalidatePath(`/patients/${patientId}`)
  return note
}

export async function updatePatientNoteAction(
  patientId: string,
  noteId: string,
  content: string,
) {
  const supabase = await createClient()
  const note = await updatePatientNote(supabase, noteId, content)
  revalidatePath(`/patients/${patientId}`)
  return note
}

export async function deletePatientNoteAction(
  patientId: string,
  noteId: string,
) {
  const supabase = await createClient()
  await deletePatientNote(supabase, noteId)
  revalidatePath(`/patients/${patientId}`)
}

export async function updateToothRecordAction(
  patientId: string,
  tooth: number,
  input: ToothRecordInput,
) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  await upsertToothRecord(supabase, clinicId, patientId, tooth, input)
  revalidatePath(`/patients/${patientId}`)
}

export async function createTreatmentRecordAction(
  input: NewTreatmentRecordInput,
) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const record = await createTreatmentRecord(supabase, clinicId, input)
  revalidatePath(`/patients/${input.patientId}`)
  return record
}

export async function addPatientBranchAction(
  patientId: string,
  branch: ClinicBranch,
) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  await addPatientBranch(supabase, clinicId, patientId, branch)
  revalidatePath(`/patients/${patientId}`)
}

export async function removePatientBranchAction(
  patientId: string,
  branch: ClinicBranch,
) {
  const supabase = await createClient()
  await removePatientBranch(supabase, patientId, branch)
  revalidatePath(`/patients/${patientId}`)
}

const MAX_PHOTO_BYTES = 8 * 1024 * 1024

export async function uploadToothPhotoAction(formData: FormData) {
  const patientId = String(formData.get('patientId') ?? '')
  const toothValue = formData.get('tooth')
  const caption = String(formData.get('caption') ?? '')
  const file = formData.get('file')

  if (!patientId || !(file instanceof File) || file.size === 0) {
    throw new AppError('A patient and an image file are required.')
  }
  if (!file.type.startsWith('image/')) {
    throw new AppError('Only image files can be uploaded.')
  }
  if (file.size > MAX_PHOTO_BYTES) {
    throw new AppError('Image must be smaller than 8MB.')
  }

  const tooth =
    typeof toothValue === 'string' && toothValue.length > 0
      ? Number(toothValue)
      : null

  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const profile = await getCurrentProfile()

  await addToothPhoto(
    supabase,
    clinicId,
    patientId,
    profile?.id,
    tooth,
    caption,
    file,
  )
  revalidatePath(`/patients/${patientId}`)
}

export async function deleteToothPhotoAction(
  patientId: string,
  photoId: string,
) {
  const supabase = await createClient()
  await deleteToothPhoto(supabase, photoId)
  revalidatePath(`/patients/${patientId}`)
}

const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024
const ALLOWED_DOCUMENT_TYPES = new Set([
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

export async function uploadPatientDocumentAction(formData: FormData) {
  const patientId = String(formData.get('patientId') ?? '')
  const caption = String(formData.get('caption') ?? '').trim()
  const file = formData.get('file')

  if (!patientId || !(file instanceof File) || file.size === 0) {
    throw new AppError('A patient and a file are required.')
  }
  if (!caption) {
    throw new AppError('A caption or note is required.')
  }
  if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) {
    throw new AppError('Unsupported file type.')
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new AppError('File must be smaller than 20MB.')
  }

  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const profile = await getCurrentProfile()

  await uploadPatientDocument(
    supabase,
    clinicId,
    patientId,
    profile?.id,
    caption,
    file,
  )
  revalidatePath(`/patients/${patientId}`)
}

export async function deletePatientDocumentAction(
  patientId: string,
  documentId: string,
) {
  const supabase = await createClient()
  await deletePatientDocument(supabase, documentId)
  revalidatePath(`/patients/${patientId}`)
}

export async function savePatientRadiographConsentAction(
  patientId: string,
  input: RadiographConsentInput,
) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const profile = await getCurrentProfile()
  await upsertPatientRadiographConsent(
    supabase,
    clinicId,
    patientId,
    profile?.id,
    input,
  )
  revalidatePath(`/patients/${patientId}`)
}

export async function getPatientDocumentUrlAction(
  filePath: string,
  downloadName?: string,
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const url = await signPatientDocumentUrl(supabase, filePath, downloadName)
    return { url }
  } catch (e) {
    return { error: toActionErrorMessage(e) }
  }
}
