'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/auth/profile'
import type { UserRole } from '@/lib/auth/types'

type ActionResult = { error?: string }

async function assertSuperAdmin() {
  const profile = await getCurrentProfile()
  if (profile?.role !== 'superadmin') throw new Error('Unauthorized')
}

/* ---------- Clinics ---------- */

export async function addClinicAction(name: string): Promise<ActionResult> {
  try {
    await assertSuperAdmin()
    const supabase = await createClient()
    const { error } = await supabase
      .from('clinics')
      .insert({ name: name.trim() })
    if (error) return { error: error.message }
    revalidatePath('/settings')
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unexpected error' }
  }
}

export async function deleteClinicAction(id: string): Promise<ActionResult> {
  try {
    await assertSuperAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from('clinics').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/settings')
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unexpected error' }
  }
}

/* ---------- Staff / User Access ---------- */

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function defaultPassword(firstName: string, lastName: string) {
  return `${capitalize(firstName)}${capitalize(lastName)}${new Date().getFullYear()}`
}

export async function addStaffAction(
  email: string,
  firstName: string,
  lastName: string,
  role: Extract<UserRole, 'admin' | 'dentist'>,
  clinicId: string,
): Promise<ActionResult> {
  try {
    await assertSuperAdmin()
    const fullName = `${firstName.trim()} ${lastName.trim()}`
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.createUser({
      email,
      password: defaultPassword(firstName.trim(), lastName.trim()),
      email_confirm: true,
      user_metadata: { full_name: fullName, role, clinic_id: clinicId },
    })
    if (error) return { error: error.message }
    revalidatePath('/settings')
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unexpected error' }
  }
}

export async function updateStaffProfileAction(
  id: string,
  role: UserRole,
  clinicId: string | null,
): Promise<ActionResult> {
  try {
    await assertSuperAdmin()
    const admin = createAdminClient()
    const { error } = await (admin as ReturnType<typeof createAdminClient>)
      .from('profiles')
      .update({ role, clinic_id: clinicId })
      .eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/settings')
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unexpected error' }
  }
}

export async function removeStaffAction(id: string): Promise<ActionResult> {
  try {
    await assertSuperAdmin()
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(id)
    if (error) return { error: error.message }
    revalidatePath('/settings')
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unexpected error' }
  }
}
