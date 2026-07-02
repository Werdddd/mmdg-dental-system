import { createAdminClient } from '@/lib/supabase/admin'
import type { SupabaseServerClient } from '@/lib/data/types'
import type { UserRole } from '@/lib/auth/types'

export interface StaffUser {
  id: string
  email: string
  fullName: string
  role: UserRole
  clinicId: string | null
  specialty: string | null
  createdAt: string
}

export async function getStaffUsers(
  supabase: SupabaseServerClient,
  clinicId?: string,
): Promise<StaffUser[]> {
  let query = supabase
    .from('profiles')
    .select('id, full_name, role, clinic_id, specialty, created_at')
    .in('role', ['admin', 'dentist', 'receptionist', 'dental_assistant'])
    .order('created_at', { ascending: true })

  if (clinicId) query = query.eq('clinic_id', clinicId)

  const { data: profiles, error } = await query

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
    clinicId: p.clinic_id,
    specialty: p.specialty ?? null,
    createdAt: p.created_at,
  }))
}
