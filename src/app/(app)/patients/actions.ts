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

export async function addPatientAction(input: NewPatientInput) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const patient = await createPatient(supabase, clinicId, input)
  revalidatePath('/patients')
  return patient
}

export async function updatePatientAction(
  patientId: string,
  input: UpdatePatientInput,
) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const patient = await updatePatient(supabase, clinicId, patientId, input)
  revalidatePath('/patients')
  revalidatePath(`/patients/${patientId}`)
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
