import type { ReactNode } from 'react'

import { getCurrentProfile } from '@/lib/auth/profile'
import { createClient } from '@/lib/supabase/server'
import { getClinics, type ClinicRecord } from '@/lib/data/clinics'
import { getActiveClinicId } from '@/lib/data/clinic'
import { MainLayout } from '@/components/layout/main-layout'

export default async function AppGroupLayout({
  children,
}: {
  children: ReactNode
}) {
  const profile = await getCurrentProfile()
  const isSuperAdmin = profile?.role === 'superadmin'

  let clinics: ClinicRecord[] = []
  let activeClinicId: string | null = null

  if (isSuperAdmin) {
    const supabase = await createClient()
    ;[clinics, activeClinicId] = await Promise.all([
      getClinics(supabase),
      getActiveClinicId(),
    ])
  }

  return (
    <MainLayout
      clinics={clinics}
      activeClinicId={activeClinicId}
      isSuperAdmin={isSuperAdmin}
    >
      {children}
    </MainLayout>
  )
}
