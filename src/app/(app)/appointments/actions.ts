'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import {
  createAppointment,
  type NewAppointmentInput,
} from '@/lib/data/appointments'

export async function addAppointmentAction(input: NewAppointmentInput) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const appointment = await createAppointment(supabase, clinicId, input)
  revalidatePath('/appointments')
  revalidatePath('/patients')
  return appointment
}
