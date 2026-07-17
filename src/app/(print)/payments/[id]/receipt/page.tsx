import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { getPaymentById } from '@/lib/data/payments'
import { getClinicById } from '@/lib/data/clinics'
import { ReceiptView } from '@/components/payments/receipt-view'

export default async function PaymentReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()

  const [payment, clinic] = await Promise.all([
    getPaymentById(supabase, clinicId, id),
    getClinicById(supabase, clinicId),
  ])

  if (!payment) notFound()

  return (
    <ReceiptView
      payment={payment}
      clinicName={clinic?.name ?? 'MMDG Dental System'}
      clinicAddress={clinic?.address ?? null}
    />
  )
}
