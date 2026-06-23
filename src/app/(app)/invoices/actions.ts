'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { createInvoice, type NewInvoiceInput } from '@/lib/data/invoices'

export async function addInvoiceAction(input: NewInvoiceInput) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const invoice = await createInvoice(supabase, clinicId, input)
  revalidatePath('/invoices')
  return invoice
}
