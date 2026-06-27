'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import {
  createAppointment,
  updateAppointmentStatus,
  type NewAppointmentInput,
} from '@/lib/data/appointments'
import type { AppointmentStatus } from '@/components/appointments/data'

export async function addAppointmentAction(input: NewAppointmentInput) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const appointment = await createAppointment(supabase, clinicId, input)
  revalidatePath('/appointments')
  revalidatePath('/patients')
  return appointment
}

export async function updateAppointmentStatusAction(
  appointmentId: string,
  status: AppointmentStatus,
  notes?: string,
): Promise<void> {
  const supabase = await createClient()
  await updateAppointmentStatus(supabase, appointmentId, status, notes)
  revalidatePath('/appointments')
  revalidatePath('/dashboard')
}
