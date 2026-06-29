'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import {
  createSponsor,
  updateSponsor,
  type SponsorInput,
} from '@/lib/data/sponsors'

export async function addSponsorAction(input: SponsorInput) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const sponsor = await createSponsor(supabase, clinicId, input)
  revalidatePath('/sponsors')
  return sponsor
}

export async function updateSponsorAction(
  sponsorId: string,
  input: SponsorInput,
) {
  const clinicId = await getActiveClinicId()
  const supabase = await createClient()
  const sponsor = await updateSponsor(supabase, clinicId, sponsorId, input)
  revalidatePath('/sponsors')
  return sponsor
}
