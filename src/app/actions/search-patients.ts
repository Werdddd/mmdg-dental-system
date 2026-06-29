'use server'

import { createClient } from '@/lib/supabase/server'
import { searchPatients, type PatientSearchResult } from '@/lib/data/patients'

export async function searchPatientsAction(
  query: string,
): Promise<PatientSearchResult[]> {
  const supabase = await createClient()
  return searchPatients(supabase, query)
}
