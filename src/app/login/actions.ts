'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export interface LoginState {
  error: string | null
}

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // Supabase isn't set up yet — let the button through to the dashboard so
  // the UI can be previewed. Real sign-in kicks in automatically once
  // NEXT_PUBLIC_SUPABASE_URL is set to a real project.
  if (!isSupabaseConfigured) {
    redirect('/dashboard')
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    redirect('/login')
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
