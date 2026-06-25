import { getCurrentProfile } from '@/lib/auth/profile'
import { createClient } from '@/lib/supabase/server'
import { getClinics } from '@/lib/data/clinics'
import { getStaffUsers } from '@/lib/data/staff'
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

  // Resolve clinic name for admin / dentist
  let clinicName: string | null = null
  if (profile?.clinic_id) {
    const { data: clinic } = await supabase
      .from('clinics')
      .select('name')
      .eq('id', profile.clinic_id)
      .single()
    clinicName = clinic?.name ?? null
  }

  const currentProfile: CurrentUserProfile = {
    firstName,
    lastName,
    email,
    role: profile?.role ?? 'dentist',
    clinicName,
    specialty: (profile as { specialty?: string | null } | null)?.specialty ?? null,
  }

  const isSuperAdmin = profile?.role === 'superadmin'

  let clinics: Awaited<ReturnType<typeof getClinics>> = []
  let staff: Awaited<ReturnType<typeof getStaffUsers>> = []

  if (isSuperAdmin) {
    ;[clinics, staff] = await Promise.all([
      getClinics(supabase),
      getStaffUsers(supabase),
    ])
  }

  return (
    <SettingsView
      currentUserId={profile?.id ?? ''}
      currentProfile={currentProfile}
      isSuperAdmin={isSuperAdmin}
      clinics={clinics}
      staff={staff}
    />
  )
}
