import { createAdminClient } from '@/lib/supabase/admin'
import type { SupabaseServerClient } from '@/lib/data/types'
import type { UserRole } from '@/lib/auth/types'

export interface StaffUser {
  id: string
  email: string
  fullName: string
  role: UserRole
  clinicIds: string[]
  specialty: string | null
  createdAt: string
}

export async function getStaffUsers(
  supabase: SupabaseServerClient,
  clinicId?: string,
): Promise<StaffUser[]> {
  let profileIds: string[] | undefined

  if (clinicId) {
    const { data: memberships, error: membershipError } = await supabase
      .from('clinic_staff')
      .select('profile_id')
      .eq('clinic_id', clinicId)
    if (membershipError) throw membershipError
    profileIds = memberships?.map((m) => m.profile_id) ?? []
    if (!profileIds.length) return []
  }

  let query = supabase
    .from('profiles')
    .select('id, full_name, role, specialty, created_at')
    .in('role', ['admin', 'dentist', 'receptionist', 'dental_assistant'])
    .order('created_at', { ascending: true })

  if (profileIds) query = query.in('id', profileIds)

  const { data: profiles, error } = await query

  if (error) throw error
  if (!profiles?.length) return []

  const admin = createAdminClient()
  const { data: memberships, error: membershipsError } = await supabase
    .from('clinic_staff')
    .select('profile_id, clinic_id')
    .in(
      'profile_id',
      profiles.map((p) => p.id),
    )
  if (membershipsError) throw membershipsError

  const clinicIdsByProfile = new Map<string, string[]>()
  for (const m of memberships ?? []) {
    const existing = clinicIdsByProfile.get(m.profile_id) ?? []
    existing.push(m.clinic_id)
    clinicIdsByProfile.set(m.profile_id, existing)
  }

  const {
    data: { users },
    error: authError,
  } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (authError) throw authError

  const emailById = new Map(users.map((u) => [u.id, u.email ?? '']))

  return profiles.map((p) => ({
    id: p.id,
    email: emailById.get(p.id) ?? '',
    fullName: p.full_name ?? '',
    role: p.role as UserRole,
    clinicIds: clinicIdsByProfile.get(p.id) ?? [],
    specialty: p.specialty ?? null,
    createdAt: p.created_at,
  }))
}

export async function getSuperAdmins(
  supabase: SupabaseServerClient,
): Promise<StaffUser[]> {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, specialty, created_at')
    .eq('role', 'superadmin')
    .order('created_at', { ascending: true })

  if (error) throw error
  if (!profiles?.length) return []

  const admin = createAdminClient()
  const {
    data: { users },
    error: authError,
  } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (authError) throw authError

  const emailById = new Map(users.map((u) => [u.id, u.email ?? '']))

  return profiles.map((p) => ({
    id: p.id,
    email: emailById.get(p.id) ?? '',
    fullName: p.full_name ?? '',
    role: p.role as UserRole,
    clinicIds: [],
    specialty: p.specialty ?? null,
    createdAt: p.created_at,
  }))
}
