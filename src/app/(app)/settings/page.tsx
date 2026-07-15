import { getCurrentProfile } from '@/lib/auth/profile'
import { createClient } from '@/lib/supabase/server'
import { getSuperAdmins } from '@/lib/data/staff'
import { getClinicsForProfile } from '@/lib/data/clinics'
import { SettingsView } from '@/components/settings/settings-view'
import type { CurrentUserProfile } from '@/components/settings/profile-panel'

export default async function SettingsPage() {
  const supabase = await createClient()
  const [profile, { data: authData }] = await Promise.all([
    getCurrentProfile(),
    supabase.auth.getUser(),
  ])

  const email = authData.user?.email ?? ''

  // Split stored full_name into first / last
  const nameParts = (profile?.full_name ?? '').trim().split(/\s+/)
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ')

  // Resolve clinic name(s) for admin / dentist — may belong to more than one
  let clinicName: string | null = null
  if (profile && profile.role !== 'superadmin') {
    const clinics = await getClinicsForProfile(supabase, profile.id)
    clinicName = clinics.length ? clinics.map((c) => c.name).join(', ') : null
  }

  const currentProfile: CurrentUserProfile = {
    firstName,
    lastName,
    email,
    role: profile?.role ?? 'dentist',
    clinicName,
    specialty:
      (profile as { specialty?: string | null } | null)?.specialty ?? null,
  }

  const isSuperAdmin = profile?.role === 'superadmin'
  const superAdmins = isSuperAdmin ? await getSuperAdmins(supabase) : []

  return (
    <SettingsView
      currentProfile={currentProfile}
      isSuperAdmin={isSuperAdmin}
      superAdmins={superAdmins}
      currentUserId={profile?.id ?? ''}
    />
  )
}
