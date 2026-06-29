'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Building2 } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ClinicRecord } from '@/lib/data/clinics'
import { setActiveClinicAction } from '@/app/actions/set-active-clinic'

interface ClinicSelectorProps {
  clinics: ClinicRecord[]
  activeClinicId: string
}

export function ClinicSelector({ clinics, activeClinicId }: ClinicSelectorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const activeName =
    clinics.find((c) => c.id === activeClinicId)?.name ?? 'Select clinic'

  function handleChange(clinicId: string | null) {
    if (!clinicId || clinicId === activeClinicId || isPending) return
    startTransition(async () => {
      await setActiveClinicAction(clinicId)
      router.refresh()
    })
  }

  return (
    <Select value={activeClinicId} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="h-9 w-52 gap-2 border-dashed bg-transparent text-sm font-medium">
        <Building2 className="size-4 shrink-0 text-muted-foreground" />
        <SelectValue placeholder="Select clinic">{activeName}</SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        {clinics.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
