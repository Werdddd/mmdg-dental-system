import { MapPin, Phone, Video } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { type badgeVariants } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import type {
  AppointmentRow,
  AppointmentStatus,
} from '@/components/appointments/data'

const STATUS_VARIANT: Record<
  AppointmentStatus,
  VariantProps<typeof badgeVariants>['variant']
> = {
  Confirmed: 'purple',
  Completed: 'success',
  Ongoing: 'warning',
  Cancelled: 'destructive',
  Rescheduled: 'info',
}

const MODE_ICON = {
  'In-person': MapPin,
  'Video Call': Video,
  'Phone Call': Phone,
} as const

interface AppointmentDetailsDialogProps {
  appointment: AppointmentRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AppointmentDetailsDialog({
  appointment,
  open,
  onOpenChange,
}: AppointmentDetailsDialogProps) {
  if (!appointment) return null

  const ModeIcon = MODE_ICON[appointment.mode]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogDescription>
            {appointment.date} &middot; {appointment.time}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <ModeIcon className="size-4" />
              {appointment.mode}
            </span>
            <StatusBadge
              status={appointment.status}
              variants={STATUS_VARIANT}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Patient
            </p>
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback>{appointment.patient.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{appointment.patient.name}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.patient.phone}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Dentist
            </p>
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback>{appointment.dentist.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{appointment.dentist.name}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.dentist.specialty}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
