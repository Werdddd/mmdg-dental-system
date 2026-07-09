'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface ChangePasswordState {
  error: string | null
}

export async function changeForcedPassword(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (password !== confirm) {
    return { error: 'Passwords do not match.' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return { error: error.message }
  }

  // Self-service profile update — no self-update RLS policy exists, so this
  // mirrors the pattern in settings/profile-actions.ts (admin client, but
  // scoped to the caller's own id, not attacker-controlled).
  const admin = createAdminClient()
  const { error: profileError } = await admin
    .from('profiles')
    .update({ must_change_password: false })
    .eq('id', user.id)

  if (profileError) {
    return { error: profileError.message }
  }

  redirect('/dashboard')
}
