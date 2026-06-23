import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/profile'

// Resolves which clinic the current page should operate on. Admins and
// Dentists always have a clinic_id. Superadmins don't (enforced by the
// profiles_role_clinic_check constraint), so — with no clinic-switcher UI
// yet — they fall back to the first clinic in the system, creating a
// default one if none exists.
export async function getActiveClinicId(): Promise<string> {
  const profile = await getCurrentProfile()

  if (!profile) {
    throw new Error('No authenticated profile found.')
  }

  if (profile.clinic_id) {
    return profile.clinic_id
  }

  const supabase = await createClient()

  const { data: existing, error: selectError } = await supabase
    .from('clinics')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (selectError) throw selectError
  if (existing) return existing.id

  const { data: created, error: insertError } = await supabase
    .from('clinics')
    .insert({ name: 'Default Clinic' })
    .select('id')
    .single()

  if (insertError) throw insertError
  return created.id
}
