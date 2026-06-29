'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { recordPayment, type NewPaymentInput } from '@/lib/data/payments'

export async function recordPaymentAction(input: NewPaymentInput) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const payment = await recordPayment(supabase, clinicId, input)
  revalidatePath('/payments')
  revalidatePath('/invoices')
  revalidatePath(`/patients/${payment.patientId}`)
  return payment
}
