import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { getPayments } from '@/lib/data/payments'
import { getInvoicesWithBalance } from '@/lib/data/invoices'
import { getDentists } from '@/lib/data/dentists'
import { PaymentsView } from '@/components/payments/payments-view'

export default async function PaymentsPage() {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const [payments, invoicesWithBalance, dentists] = await Promise.all([
    getPayments(supabase, clinicId),
    getInvoicesWithBalance(supabase, clinicId),
    getDentists(supabase, clinicId),
  ])

  return (
    <PaymentsView
      key={clinicId}
      initialPayments={payments}
      invoicesWithBalance={invoicesWithBalance}
      dentists={dentists}
    />
  )
}
