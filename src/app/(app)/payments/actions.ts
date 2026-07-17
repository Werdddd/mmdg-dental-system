'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import {
  recordPayment,
  refundPayment,
  updatePayment,
  uploadPaymentProof,
  type NewPaymentInput,
  type UpdatePaymentInput,
} from '@/lib/data/payments'
import type { SupabaseServerClient } from '@/lib/data/types'
import type { PaymentMethod } from '@/components/payments/data'
import { AppError } from '@/lib/errors'
import type { SignatureValue } from '@/lib/dental/signature'

const MAX_PROOF_PHOTO_BYTES = 8 * 1024 * 1024

async function uploadProofIfProvided(
  supabase: SupabaseServerClient,
  clinicId: string,
  formData: FormData,
): Promise<string | undefined> {
  const proofFile = formData.get('proofPhoto')
  if (!(proofFile instanceof File) || proofFile.size === 0) return undefined

  if (!proofFile.type.startsWith('image/')) {
    throw new AppError('Proof of payment must be an image file.')
  }
  if (proofFile.size > MAX_PROOF_PHOTO_BYTES) {
    throw new AppError('Proof of payment image must be smaller than 8MB.')
  }
  return uploadPaymentProof(supabase, clinicId, proofFile)
}

function readSignature(formData: FormData): SignatureValue {
  const signatureType = String(formData.get('signatureType') ?? '')
  const signatureData = String(formData.get('signatureData') ?? '')
  if (
    (signatureType !== 'drawn' && signatureType !== 'typed') ||
    !signatureData
  ) {
    throw new AppError('Patient signature is required to record a payment.')
  }
  return { type: signatureType, data: signatureData }
}

export async function recordPaymentAction(formData: FormData) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()

  const proofPhotoPath = (await uploadProofIfProvided(supabase, clinicId, formData)) ?? null
  const signature = readSignature(formData)

  const input: NewPaymentInput = {
    invoiceId: String(formData.get('invoiceId') ?? ''),
    amount: Number(formData.get('amount') ?? 0),
    method: String(formData.get('method') ?? 'Cash') as PaymentMethod,
    date: String(formData.get('date') ?? ''),
    bankName: String(formData.get('bankName') ?? ''),
    referenceNumber: String(formData.get('referenceNumber') ?? ''),
    proofPhotoPath,
    signature,
    signaturePrintedName: String(formData.get('signaturePrintedName') ?? ''),
  }

  const payment = await recordPayment(supabase, clinicId, input)
  revalidatePath('/payments')
  revalidatePath('/invoices')
  revalidatePath(`/patients/${payment.patientId}`)
  return payment
}

export async function updatePaymentAction(formData: FormData) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()

  const proofPhotoPath = await uploadProofIfProvided(supabase, clinicId, formData)
  const signature = readSignature(formData)

  const input: UpdatePaymentInput = {
    id: String(formData.get('paymentId') ?? ''),
    amount: Number(formData.get('amount') ?? 0),
    method: String(formData.get('method') ?? 'Cash') as PaymentMethod,
    date: String(formData.get('date') ?? ''),
    bankName: String(formData.get('bankName') ?? ''),
    referenceNumber: String(formData.get('referenceNumber') ?? ''),
    proofPhotoPath,
    signature,
    signaturePrintedName: String(formData.get('signaturePrintedName') ?? ''),
  }

  const payment = await updatePayment(supabase, clinicId, input)
  revalidatePath('/payments')
  revalidatePath('/invoices')
  revalidatePath(`/patients/${payment.patientId}`)
  return payment
}

export async function refundPaymentAction(paymentId: string) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()

  const payment = await refundPayment(supabase, clinicId, paymentId)
  revalidatePath('/payments')
  revalidatePath('/invoices')
  revalidatePath(`/patients/${payment.patientId}`)
  return payment
}
