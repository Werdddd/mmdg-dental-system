import type { SupabaseServerClient } from '@/lib/data/types'

export interface ClinicRecord {
  id: string
  name: string
}

export async function getClinics(
  supabase: SupabaseServerClient,
): Promise<ClinicRecord[]> {
  const { data, error } = await supabase
    .from('clinics')
    .select('id, name')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}
