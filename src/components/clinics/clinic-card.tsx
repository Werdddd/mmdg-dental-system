'use client'

import { useRouter } from 'next/navigation'
import { Banknote, Building2, MapPin, MoreVertical, Users } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/utils'
import type { ClinicRecord } from '@/lib/data/clinics'

interface ClinicCardProps {
  clinic: ClinicRecord
  staffCount: number
  revenue: number
  onDelete: (id: string) => void
}

export function ClinicCard({
  clinic,
  staffCount,
  revenue,
  onDelete,
}: ClinicCardProps) {
  const router = useRouter()

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/clinics/${clinic.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') router.push(`/clinics/${clinic.id}`)
      }}
      className="relative flex cursor-pointer flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Clinic actions"
          onClick={(event) => event.stopPropagation()}
          className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => router.push(`/clinics/${clinic.id}`)}
          >
            View clinic
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive data-[highlighted]:text-destructive"
            onClick={(event) => {
              event.stopPropagation()
              onDelete(clinic.id)
            }}
          >
            Remove clinic
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-3 pr-8">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold">{clinic.name}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{clinic.address || 'No address on file'}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="size-3.5" />
          {staffCount} staff
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <Banknote className="size-3.5 text-muted-foreground" />
          {formatCurrency(revenue)}
        </div>
      </div>
    </div>
  )
}
