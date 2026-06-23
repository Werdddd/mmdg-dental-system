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
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, specialty')
    .eq('role', 'dentist')
    .eq('clinic_id', clinicId)
    .order('full_name')

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.full_name ?? 'Unnamed Dentist',
    initials: initialsOf(row.full_name ?? '??'),
    specialty: row.specialty ?? 'General Dentist',
  }))
}
