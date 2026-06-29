'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import {
  generateInvoice,
  type GenerateInvoiceInput,
} from '@/lib/data/invoices'

export async function generateInvoiceAction(input: GenerateInvoiceInput) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const invoice = await generateInvoice(supabase, clinicId, input)
  revalidatePath('/invoices')
  revalidatePath(`/patients/${input.patientId}`)
  return invoice
}
