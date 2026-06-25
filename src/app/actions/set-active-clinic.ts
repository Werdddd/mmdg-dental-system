'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { ACTIVE_CLINIC_COOKIE } from '@/lib/data/clinic'

export async function setActiveClinicAction(clinicId: string): Promise<void> {
  const store = await cookies()
  store.set(ACTIVE_CLINIC_COOKIE, clinicId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  revalidatePath('/', 'layout')
}
