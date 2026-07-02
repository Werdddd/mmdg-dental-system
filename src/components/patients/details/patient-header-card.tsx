'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CalendarPlus,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { PatientRow } from '@/components/patients/data'
import type { PatientProfile } from '@/components/patients/details/data'

interface PatientHeaderCardProps {
  patient: PatientRow
  profile: PatientProfile
}

export function PatientHeaderCard({
  patient,
  profile,
}: PatientHeaderCardProps) {
  const [documentsOpen, setDocumentsOpen] = useState(false)

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <Avatar className="size-20 shrink-0">
            {patient.photoUrl ? (
              <AvatarImage src={patient.photoUrl} alt={patient.name} />
            ) : (
              <AvatarFallback className="text-xl">
                {patient.initials}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-xl font-semibold tracking-tight">
                {patient.name}
              </h1>
              <Badge variant="purple">{profile.patientCode}</Badge>
              <Badge
                variant={
                  patient.treatmentStatus === 'Active' ? 'warning' : 'success'
                }
              >
                {patient.treatmentStatus}
              </Badge>
            </div>

            <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
              <MapPin className="size-3.5 shrink-0" />
              {patient.address}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
              <span className="flex items-center gap-1.5">
                <Phone className="size-3.5" />
                {profile.about.contactNumber}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="size-3.5" />
                {profile.about.email}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              Last visit:{' '}
              <span className="text-foreground">{patient.lastAppointment}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 lg:justify-end">
          <Link
            href={`/patients/${patient.id}/edit`}
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-1.5')}
          >
            <Pencil className="size-4" />
            Edit Patient
          </Link>
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => setDocumentsOpen(true)}
          >
            <FileText className="size-4" />
            View Documents
          </Button>
          <Link
            href="/appointments"
            className={cn(buttonVariants({ variant: 'default' }), 'gap-1.5')}
          >
            <CalendarPlus className="size-4" />
            Book Appointment
          </Link>
        </div>
      </div>

      <Dialog open={documentsOpen} onOpenChange={setDocumentsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Patient Documents</DialogTitle>
            <DialogDescription>
              Files and records uploaded for {patient.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No documents have been uploaded yet.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
