import { redirect } from 'next/navigation'

import { getCurrentProfile } from '@/lib/auth/profile'
import { createClient } from '@/lib/supabase/server'
import { getClinics } from '@/lib/data/clinics'
import { getStaffUsers } from '@/lib/data/staff'
import { getRevenueByClinic } from '@/lib/data/payments'
import { ClinicsView } from '@/components/clinics/clinics-view'

export default async function ClinicsPage() {
  const profile = await getCurrentProfile()
  if (profile?.role !== 'superadmin') redirect('/dashboard')

  const supabase = await createClient()
  const [clinics, staff, revenueByClinic] = await Promise.all([
    getClinics(supabase),
    getStaffUsers(supabase),
    getRevenueByClinic(supabase),
  ])

  const staffCountByClinic: Record<string, number> = {}
  for (const user of staff) {
    if (!user.clinicId) continue
    staffCountByClinic[user.clinicId] =
      (staffCountByClinic[user.clinicId] ?? 0) + 1
  }

  return (
    <ClinicsView
      clinics={clinics}
      staffCountByClinic={staffCountByClinic}
      revenueByClinic={revenueByClinic}
    />
  )
}
