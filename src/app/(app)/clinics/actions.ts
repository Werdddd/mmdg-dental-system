'use server'

import { revalidatePath } from 'next/cache'
import { isAuthApiError } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/auth/profile'
import { defaultPassword } from '@/lib/auth/default-password'
import { ROLE_LABELS } from '@/lib/auth/role-labels'
import type { UserRole } from '@/lib/auth/types'
import { AppError, toActionErrorMessage } from '@/lib/errors'

type ActionResult = { error?: string; info?: string }

async function assertSuperAdmin() {
  const profile = await getCurrentProfile()
  if (profile?.role !== 'superadmin') throw new AppError('Unauthorized')
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
    if (error) throw error
    revalidatePath('/clinics')
    return {}
  } catch (e) {
    return { error: toActionErrorMessage(e) }
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
    if (error) throw error
    revalidatePath('/clinics')
    revalidatePath(`/clinics/${id}`)
    return {}
  } catch (e) {
    return { error: toActionErrorMessage(e) }
  }
}

export async function deleteClinicAction(id: string): Promise<ActionResult> {
  try {
    await assertSuperAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from('clinics').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/clinics')
    return {}
  } catch (e) {
    return { error: toActionErrorMessage(e) }
  }
}

/* ---------- Staff / User Access ---------- */

async function linkExistingStaffToClinic(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
  clinicId: string,
): Promise<ActionResult> {
  const {
    data: { users },
    error: listError,
  } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (listError) throw listError

  const existingUser = users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  )
  if (!existingUser) {
    throw new AppError(
      'This email is already registered, but the matching account could not be found.',
    )
  }

  const { data: existingProfile, error: profileError } = await admin
    .from('profiles')
    .select('role')
    .eq('id', existingUser.id)
    .single()
  if (profileError) throw profileError

  if (existingProfile.role === 'superadmin') {
    throw new AppError(
      'This email belongs to a SuperAdmin account and can’t be added as clinic staff.',
    )
  }

  const { error: linkError } = await admin.from('clinic_staff').upsert(
    { profile_id: existingUser.id, clinic_id: clinicId },
    { onConflict: 'profile_id,clinic_id', ignoreDuplicates: true },
  )
  if (linkError) throw linkError

  revalidatePath('/clinics')
  revalidatePath(`/clinics/${clinicId}`)
  return {
    info: `This email is already registered as ${ROLE_LABELS[existingProfile.role as UserRole]}. Added them to this clinic — their role stays the same everywhere they work.`,
  }
}

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
    if (error) {
      if (isAuthApiError(error) && error.code === 'email_exists') {
        return await linkExistingStaffToClinic(admin, email, clinicId)
      }
      throw error
    }
    revalidatePath('/clinics')
    revalidatePath(`/clinics/${clinicId}`)
    return {}
  } catch (e) {
    return { error: toActionErrorMessage(e) }
  }
}

export async function updateStaffProfileAction(
  id: string,
  role: UserRole,
  clinicId?: string,
): Promise<ActionResult> {
  try {
    await assertSuperAdmin()
    const admin = createAdminClient()
    const { error } = await admin.from('profiles').update({ role }).eq('id', id)
    if (error) throw error
    revalidatePath('/clinics')
    if (clinicId) revalidatePath(`/clinics/${clinicId}`)
    return {}
  } catch (e) {
    return { error: toActionErrorMessage(e) }
  }
}

export async function removeStaffAction(
  id: string,
  clinicId: string,
): Promise<ActionResult> {
  try {
    await assertSuperAdmin()
    const admin = createAdminClient()
    const { error: deleteError } = await admin
      .from('clinic_staff')
      .delete()
      .eq('profile_id', id)
      .eq('clinic_id', clinicId)
    if (deleteError) throw deleteError

    const { count, error: countError } = await admin
      .from('clinic_staff')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', id)
    if (countError) throw countError

    if (!count) {
      const { error: deleteUserError } = await admin.auth.admin.deleteUser(id)
      if (deleteUserError) throw deleteUserError
    }

    revalidatePath('/clinics')
    revalidatePath(`/clinics/${clinicId}`)
    return {}
  } catch (e) {
    return { error: toActionErrorMessage(e) }
  }
}
