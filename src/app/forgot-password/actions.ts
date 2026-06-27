'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export interface ForgotPasswordState {
  error: string | null
  success: boolean
}

export async function forgotPassword(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = formData.get('email') as string

  if (!isSupabaseConfigured) {
    // Preview mode — simulate success so the UI can be tested
    return { error: null, success: true }
  }

  const origin = (await headers()).get('origin') ?? 'http://localhost:3000'
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  return { error: null, success: true }
}
