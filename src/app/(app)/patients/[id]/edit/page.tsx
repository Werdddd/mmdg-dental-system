import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { getActiveClinicId } from '@/lib/data/clinic'
import { getCurrentProfile } from '@/lib/auth/profile'
import { getPatientById, getPatientIntakeExtras } from '@/lib/data/patients'
import { PatientIntakeForm } from '@/components/patients/intake/patient-intake-form'
import { patientToIntakeFormValues } from '@/components/patients/intake/types'

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const clinicId = await getActiveClinicId()

  const patient = await getPatientById(supabase, id)
  if (!patient) notFound()

  // Only the patient's home clinic can edit their profile — visiting
  // clinics get a read-only chart on the detail page. RLS already blocks
  // the actual write; this just avoids showing an edit form that would
  // fail on submit.
  const profile = await getCurrentProfile()
  if (profile?.role !== 'superadmin' && patient.clinicId !== clinicId) {
    redirect(`/patients/${id}`)
  }

  const { medicalHistory, consentForm } = await getPatientIntakeExtras(
    supabase,
    id,
  )

  return (
    <div className="space-y-4">
      <Link
        href={`/patients/${id}`}
        className={cn(buttonVariants({ variant: 'ghost' }), 'gap-1.5 px-2')}
      >
        <ArrowLeft className="size-4" />
        Back to {patient.name}
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Patient</h1>
        <p className="text-muted-foreground">
          Update {patient.name}&apos;s intake record.
        </p>
      </div>

      <PatientIntakeForm
        mode="edit"
        patientId={patient.id}
        initialValues={patientToIntakeFormValues(
          patient,
          medicalHistory,
          consentForm,
        )}
        initialPhotoUrl={patient.photoUrl}
        readOnlyMetadata={patient.systemMetadata}
      />
    </div>
  )
}
