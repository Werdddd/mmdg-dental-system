import { initialsOf } from '@/lib/utils'
import type { SupabaseServerClient } from '@/lib/data/types'

export interface DentistOption {
  id: string
  name: string
  initials: string
  specialty: string
}

export async function getDentists(
  supabase: SupabaseServerClient,
  clinicId: string,
): Promise<DentistOption[]> {
  const { data: memberships, error: membershipError } = await supabase
    .from('clinic_staff')
    .select('profile_id')
    .eq('clinic_id', clinicId)
  if (membershipError) throw membershipError
  if (!memberships?.length) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, specialty')
    .eq('role', 'dentist')
    .in(
      'id',
      memberships.map((m) => m.profile_id),
    )
    .order('full_name')

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.full_name ?? 'Unnamed Dentist',
    initials: initialsOf(row.full_name ?? '??'),
    specialty: row.specialty ?? 'General Dentist',
  }))
}
