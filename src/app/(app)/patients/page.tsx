import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { getPatients } from '@/lib/data/patients'
import { PatientsView } from '@/components/patients/patients-view'

export default async function PatientsPage() {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const patients = await getPatients(supabase, clinicId)

  return <PatientsView initialPatients={patients} />
}
