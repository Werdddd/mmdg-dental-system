'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppError, toActionErrorMessage } from '@/lib/errors'

type ActionResult = { error?: string; success?: boolean }

export async function updateProfileAction(
  firstName: string,
  lastName: string,
  specialty: string,
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new AppError('Not authenticated')

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
    const admin = createAdminClient()
    const { error } = await admin
      .from('profiles')
      .update({
        full_name: fullName,
        specialty: specialty.trim() || null,
      })
      .eq('id', user.id)

    if (error) throw error
    revalidatePath('/settings')
    return { success: true }
  } catch (e) {
    return { error: toActionErrorMessage(e) }
  }
}

export async function changePasswordAction(
  newPassword: string,
  confirmPassword: string,
): Promise<ActionResult> {
  if (newPassword !== confirmPassword)
    return { error: 'Passwords do not match' }
  if (newPassword.length < 8)
    return { error: 'Password must be at least 8 characters' }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    return { success: true }
  } catch (e) {
    return { error: toActionErrorMessage(e) }
  }
}
