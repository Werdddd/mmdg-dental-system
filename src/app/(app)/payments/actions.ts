'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import {
  recordPayment,
  uploadPaymentProof,
  type NewPaymentInput,
} from '@/lib/data/payments'
import type { PaymentMethod } from '@/components/payments/data'

const MAX_PROOF_PHOTO_BYTES = 8 * 1024 * 1024

export async function recordPaymentAction(formData: FormData) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()

  const proofFile = formData.get('proofPhoto')
  let proofPhotoPath: string | null = null
  if (proofFile instanceof File && proofFile.size > 0) {
    if (!proofFile.type.startsWith('image/')) {
      throw new Error('Proof of payment must be an image file.')
    }
    if (proofFile.size > MAX_PROOF_PHOTO_BYTES) {
      throw new Error('Proof of payment image must be smaller than 8MB.')
    }
    proofPhotoPath = await uploadPaymentProof(supabase, clinicId, proofFile)
  }

  const input: NewPaymentInput = {
    invoiceId: String(formData.get('invoiceId') ?? ''),
    amount: Number(formData.get('amount') ?? 0),
    method: String(formData.get('method') ?? 'Cash') as PaymentMethod,
    date: String(formData.get('date') ?? ''),
    bankName: String(formData.get('bankName') ?? ''),
    referenceNumber: String(formData.get('referenceNumber') ?? ''),
    proofPhotoPath,
  }

  const payment = await recordPayment(supabase, clinicId, input)
  revalidatePath('/payments')
  revalidatePath('/invoices')
  revalidatePath(`/patients/${payment.patientId}`)
  return payment
}
