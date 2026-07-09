'use server'

import { revalidatePath } from 'next/cache'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentProfile } from '@/lib/auth/profile'
import { defaultPassword } from '@/lib/auth/default-password'

type ActionResult = { error?: string }

async function assertSuperAdmin() {
  const profile = await getCurrentProfile()
  if (profile?.role !== 'superadmin') throw new Error('Unauthorized')
  return profile
}

export async function addSuperAdminAction(
  email: string,
  firstName: string,
  lastName: string,
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
        role: 'superadmin',
        must_change_password: true,
      },
    })
    if (error) return { error: error.message }
    revalidatePath('/settings')
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unexpected error' }
  }
}

export async function removeSuperAdminAction(
  id: string,
): Promise<ActionResult> {
  try {
    const profile = await assertSuperAdmin()
    if (profile.id === id)
      return { error: 'You cannot remove your own access.' }
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(id)
    if (error) return { error: error.message }
    revalidatePath('/settings')
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unexpected error' }
  }
}
