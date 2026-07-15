import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/auth/types'

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, role, must_change_password')
    .eq('id', user.id)
    .single()

  return data
}
