import { MoreHorizontal, Phone, Video, MapPin } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge, type badgeVariants } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { VariantProps } from 'class-variance-authority'
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

interface AppointmentsTableProps {
  appointments: AppointmentRow[]
}

export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th className="px-5 py-3 font-medium">Date &amp; Time</th>
            <th className="px-5 py-3 font-medium">Patient</th>
            <th className="px-5 py-3 font-medium">Dentist</th>
            <th className="px-5 py-3 font-medium">Mode</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {appointments.map((appt) => {
            const ModeIcon = MODE_ICON[appt.mode]
            return (
              <tr key={appt.id} className="hover:bg-muted/40">
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <p className="font-medium">{appt.date}</p>
                  <p className="text-xs text-muted-foreground">{appt.time}</p>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback>{appt.patient.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium whitespace-nowrap">
                        {appt.patient.name}
                      </p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {appt.patient.phone}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback>{appt.dentist.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium whitespace-nowrap">
                        {appt.dentist.name}
                      </p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {appt.dentist.specialty}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <ModeIcon className="size-3.5" />
                    {appt.mode}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={STATUS_VARIANT[appt.status]}>
                    {appt.status}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Appointment actions"
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Reschedule</DropdownMenuItem>
                      <DropdownMenuItem>Cancel appointment</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {appointments.length === 0 && (
        <div className="px-5 py-12 text-center text-sm text-muted-foreground">
          No appointments match your search.
        </div>
      )}
    </div>
  )
}
