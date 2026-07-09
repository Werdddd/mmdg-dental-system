'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/auth/profile'
import { defaultPassword } from '@/lib/auth/default-password'
import type { UserRole } from '@/lib/auth/types'

type ActionResult = { error?: string }

async function assertSuperAdmin() {
  const profile = await getCurrentProfile()
  if (profile?.role !== 'superadmin') throw new Error('Unauthorized')
}

/* ---------- Clinics ---------- */

export async function addClinicAction(
  name: string,
  address: string,
): Promise<ActionResult> {
  try {
    await assertSuperAdmin()
    const supabase = await createClient()
    const { error } = await supabase
      .from('clinics')
      .insert({ name: name.trim(), address: address.trim() || null })
    if (error) return { error: error.message }
    revalidatePath('/clinics')
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unexpected error' }
  }
}

export async function updateClinicAction(
  id: string,
  name: string,
  address: string,
): Promise<ActionResult> {
  try {
    await assertSuperAdmin()
    const supabase = await createClient()
    const { error } = await supabase
      .from('clinics')
      .update({ name: name.trim(), address: address.trim() || null })
      .eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/clinics')
    revalidatePath(`/clinics/${id}`)
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
    revalidatePath('/clinics')
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unexpected error' }
  }
}

/* ---------- Staff / User Access ---------- */

export async function addStaffAction(
  email: string,
  firstName: string,
  lastName: string,
  role: Extract<
    UserRole,
    'admin' | 'dentist' | 'receptionist' | 'dental_assistant'
  >,
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
      user_metadata: {
        full_name: fullName,
        role,
        clinic_id: clinicId,
        must_change_password: true,
      },
    })
    if (error) return { error: error.message }
    revalidatePath('/clinics')
    revalidatePath(`/clinics/${clinicId}`)
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
    revalidatePath('/clinics')
    if (clinicId) revalidatePath(`/clinics/${clinicId}`)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unexpected error' }
  }
}

export async function removeStaffAction(
  id: string,
  clinicId?: string,
): Promise<ActionResult> {
  try {
    await assertSuperAdmin()
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(id)
    if (error) return { error: error.message }
    revalidatePath('/clinics')
    if (clinicId) revalidatePath(`/clinics/${clinicId}`)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unexpected error' }
  }
}
