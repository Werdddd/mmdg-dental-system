import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { getPatients } from '@/lib/data/patients'
import { getSponsors } from '@/lib/data/sponsors'
import { PatientsView } from '@/components/patients/patients-view'

export default async function PatientsPage() {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const [patients, sponsors] = await Promise.all([
    getPatients(supabase, clinicId),
    getSponsors(supabase, clinicId),
  ])

  return (
    <PatientsView key={clinicId} initialPatients={patients} sponsors={sponsors} />
  )
}
