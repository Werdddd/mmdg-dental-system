import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { getPayments } from '@/lib/data/payments'
import { getPatients } from '@/lib/data/patients'
import { getInvoicesWithBalance } from '@/lib/data/invoices'
import { getSponsors } from '@/lib/data/sponsors'
import { PaymentsView } from '@/components/payments/payments-view'

export default async function PaymentsPage() {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const [payments, patients, invoicesWithBalance, sponsors] = await Promise.all([
    getPayments(supabase, clinicId),
    getPatients(supabase, clinicId),
    getInvoicesWithBalance(supabase, clinicId),
    getSponsors(supabase, clinicId),
  ])

  return (
    <PaymentsView
      key={clinicId}
      initialPayments={payments}
      patients={patients}
      invoicesWithBalance={invoicesWithBalance}
      sponsors={sponsors}
    />
  )
}
