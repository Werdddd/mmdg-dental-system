'use client'

import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { PatientsToolbar } from '@/components/patients/patients-toolbar'
import { PatientCard } from '@/components/patients/patient-card'
import { PATIENTS } from '@/components/patients/data'
import { cn } from '@/lib/utils'

export function PatientsView() {
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return PATIENTS
    return PATIENTS.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        patient.address.toLowerCase().includes(query),
    )
  }, [search])

  return (
    <>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
          <Badge variant="purple">{PATIENTS.length} total patients</Badge>
        </div>
        <p className="text-muted-foreground">
          Browse and manage every patient registered at your clinic.
        </p>
      </div>

      <PatientsToolbar
        search={search}
        onSearchChange={setSearch}
        view={view}
        onViewChange={setView}
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground shadow-sm">
          No patients match your search.
        </div>
      ) : (
        <div
          className={cn(
            view === 'grid'
              ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'
              : 'flex flex-col gap-3',
          )}
        >
          {filtered.map((patient) => (
            <PatientCard key={patient.id} patient={patient} view={view} />
          ))}
        </div>
      )}
    </>
  )
}
