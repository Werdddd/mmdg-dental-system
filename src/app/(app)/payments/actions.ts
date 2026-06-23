'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { createPayment, type NewPaymentInput } from '@/lib/data/payments'

export async function addPaymentAction(input: NewPaymentInput) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const payment = await createPayment(supabase, clinicId, input)
  revalidatePath('/payments')
  return payment
}
