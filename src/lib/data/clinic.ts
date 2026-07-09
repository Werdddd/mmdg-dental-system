import { cookies } from 'next/headers'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/profile'
import { AppError } from '@/lib/errors'

export const ACTIVE_CLINIC_COOKIE = 'sa_active_clinic'

export async function getActiveClinicId(): Promise<string> {
  const profile = await getCurrentProfile()

  if (!profile) {
    throw new AppError('No authenticated profile found.')
  }

  // Admin / Dentist: their clinic is fixed by their profile
  if (profile.clinic_id) {
    return profile.clinic_id
  }

  // SuperAdmin: check for a cookie-persisted selection
  const cookieStore = await cookies()
  const cookieClinicId = cookieStore.get(ACTIVE_CLINIC_COOKIE)?.value

  const supabase = await createClient()

  if (cookieClinicId) {
    const { data } = await supabase
      .from('clinics')
      .select('id')
      .eq('id', cookieClinicId)
      .maybeSingle()
    if (data) return data.id
  }

  // Fallback: first clinic in the system
  const { data: existing, error: selectError } = await supabase
    .from('clinics')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (selectError) throw selectError
  if (existing) return existing.id

  // Last resort: create a default clinic
  const { data: created, error: insertError } = await supabase
    .from('clinics')
    .insert({ name: 'Default Clinic' })
    .select('id')
    .single()

  if (insertError) throw insertError
  return created.id
}
