import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { PatientIntakeForm } from '@/components/patients/intake/patient-intake-form'

export default function NewPatientPage() {
  return (
    <div className="space-y-4">
      <Link
        href="/patients"
        className={cn(buttonVariants({ variant: 'ghost' }), 'gap-1.5 px-2')}
      >
        <ArrowLeft className="size-4" />
        Back to Patients
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Patient</h1>
        <p className="text-muted-foreground">
          Register a new patient and complete their clinical intake.
        </p>
      </div>

      <PatientIntakeForm mode="create" />
    </div>
  )
}
