import type { SupabaseServerClient } from '@/lib/data/types'

export interface ClinicRecord {
  id: string
  name: string
  address: string | null
}

export async function getClinics(
  supabase: SupabaseServerClient,
): Promise<ClinicRecord[]> {
  const { data, error } = await supabase
    .from('clinics')
    .select('id, name, address')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getClinicsForProfile(
  supabase: SupabaseServerClient,
  profileId: string,
): Promise<ClinicRecord[]> {
  const { data: memberships, error: membershipError } = await supabase
    .from('clinic_staff')
    .select('clinic_id')
    .eq('profile_id', profileId)
  if (membershipError) throw membershipError
  if (!memberships?.length) return []

  const clinicIds = memberships.map((m) => m.clinic_id)
  const { data, error } = await supabase
    .from('clinics')
    .select('id, name, address')
    .in('id', clinicIds)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export interface ClinicDetail extends ClinicRecord {
  createdAt: string
}

export async function getClinicById(
  supabase: SupabaseServerClient,
  id: string,
): Promise<ClinicDetail | null> {
  const { data, error } = await supabase
    .from('clinics')
    .select('id, name, address, created_at')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    id: data.id,
    name: data.name,
    address: data.address,
    createdAt: data.created_at,
  }
}
