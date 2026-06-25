import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { getPayments } from '@/lib/data/payments'
import { getPatients } from '@/lib/data/patients'
import { getDentists } from '@/lib/data/dentists'
import { PaymentsView } from '@/components/payments/payments-view'

export default async function PaymentsPage() {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const [payments, patients, dentists] = await Promise.all([
    getPayments(supabase, clinicId),
    getPatients(supabase, clinicId),
    getDentists(supabase, clinicId),
  ])

  return (
    <PaymentsView
      key={clinicId}
      initialPayments={payments}
      patients={patients}
      dentists={dentists}
    />
  )
}
