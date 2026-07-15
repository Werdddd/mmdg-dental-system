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

  const supabase = await createClient()
  const cookieStore = await cookies()
  const cookieClinicId = cookieStore.get(ACTIVE_CLINIC_COOKIE)?.value

  if (profile.role !== 'superadmin') {
    // Clinic staff: scoped to whichever clinic(s) they're a member of.
    const { data: memberships, error: membershipError } = await supabase
      .from('clinic_staff')
      .select('clinic_id')
      .eq('profile_id', profile.id)
    if (membershipError) throw membershipError
    if (!memberships?.length) {
      throw new AppError('No clinic assigned to this account.')
    }

    const clinicIds = memberships.map((m) => m.clinic_id)
    if (cookieClinicId && clinicIds.includes(cookieClinicId)) {
      return cookieClinicId
    }
    if (clinicIds.length === 1) {
      return clinicIds[0]
    }

    // 2+ memberships, no valid cookie: default to the earliest-created clinic.
    const { data: earliest, error: earliestError } = await supabase
      .from('clinics')
      .select('id')
      .in('id', clinicIds)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    if (earliestError) throw earliestError
    return earliest.id
  }

  // SuperAdmin: check for a cookie-persisted selection
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
