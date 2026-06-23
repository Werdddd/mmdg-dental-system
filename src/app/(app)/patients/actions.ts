'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { createPatient, type NewPatientInput } from '@/lib/data/patients'

export async function addPatientAction(input: NewPatientInput) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const patient = await createPatient(supabase, clinicId, input)
  revalidatePath('/patients')
  return patient
}
