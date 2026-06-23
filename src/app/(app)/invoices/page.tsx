import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { getInvoices } from '@/lib/data/invoices'
import { getPatients } from '@/lib/data/patients'
import { InvoicesView } from '@/components/invoices/invoices-view'

export default async function InvoicesPage() {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const [invoices, patients] = await Promise.all([
    getInvoices(supabase, clinicId),
    getPatients(supabase, clinicId),
  ])

  return <InvoicesView initialInvoices={invoices} patients={patients} />
}
