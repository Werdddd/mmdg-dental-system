import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { getSponsors } from '@/lib/data/sponsors'
import { SponsorsView } from '@/components/sponsors/sponsors-view'

export default async function SponsorsPage() {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const sponsors = await getSponsors(supabase, clinicId)

  return <SponsorsView key={clinicId} initialSponsors={sponsors} />
}
