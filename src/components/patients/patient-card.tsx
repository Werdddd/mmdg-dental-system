import { CalendarDays, MapPin, MoreVertical } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { PatientRow } from '@/components/patients/data'

interface PatientCardProps {
  patient: PatientRow
  view: 'grid' | 'list'
}

export function PatientCard({ patient, view }: PatientCardProps) {
  const isList = view === 'list'

  return (
    <div
      className={cn(
        'relative rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md',
        isList && 'flex items-center gap-4',
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Patient actions"
          className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>View profile</DropdownMenuItem>
          <DropdownMenuItem>Edit patient</DropdownMenuItem>
          <DropdownMenuItem>Schedule appointment</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div
        className={cn(
          'flex items-center gap-3',
          !isList && 'flex-col text-center',
        )}
      >
        <Avatar className={cn(isList ? 'size-12' : 'size-16')}>
          <AvatarFallback className="text-base">
            {patient.initials}
          </AvatarFallback>
        </Avatar>
        <div className={cn(!isList && 'pr-4')}>
          <p className="font-semibold">{patient.name}</p>
          <p className="text-sm text-muted-foreground">
            {patient.age} yrs · {patient.gender}
          </p>
        </div>
      </div>

      <div
        className={cn(
          'space-y-2 text-sm',
          isList
            ? 'ml-auto flex flex-1 items-center justify-end gap-8 text-right'
            : 'mt-4 border-t pt-4',
        )}
      >
        <div
          className={cn(
            'flex items-center gap-2 text-muted-foreground',
            !isList && 'justify-center',
          )}
        >
          <CalendarDays className="size-3.5 shrink-0" />
          <span className="text-foreground">
            {patient.lastAppointment} — {patient.lastAppointmentReason}
          </span>
        </div>
        <div
          className={cn(
            'flex items-center gap-2 text-muted-foreground',
            !isList && 'justify-center',
          )}
        >
          <MapPin className="size-3.5 shrink-0" />
          <span>{patient.address}</span>
        </div>
      </div>
    </div>
  )
}
