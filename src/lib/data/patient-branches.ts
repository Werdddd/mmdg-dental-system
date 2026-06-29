import type { SupabaseServerClient } from '@/lib/data/types'
import type { ClinicBranch } from '@/lib/dental/branches'

export async function getPatientBranches(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
): Promise<ClinicBranch[]> {
  const { data, error } = await supabase
    .from('patient_branch_tags')
    .select('branch')
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)

  if (error) throw error
  return (data ?? []).map((row) => row.branch as ClinicBranch)
}

export async function addPatientBranch(
  supabase: SupabaseServerClient,
  clinicId: string,
  patientId: string,
  branch: ClinicBranch,
): Promise<void> {
  const { error } = await supabase
    .from('patient_branch_tags')
    .insert({ clinic_id: clinicId, patient_id: patientId, branch })

  // 23505 = unique_violation — the tag is already there, nothing to do.
  if (error && error.code !== '23505') throw error
}

export async function removePatientBranch(
  supabase: SupabaseServerClient,
  patientId: string,
  branch: ClinicBranch,
): Promise<void> {
  const { error } = await supabase
    .from('patient_branch_tags')
    .delete()
    .eq('patient_id', patientId)
    .eq('branch', branch)

  if (error) throw error
}
