'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/shared/pagination'
import { ClinicSelector } from '@/components/layout/clinic-selector'
import { useClinicContext } from '@/components/layout/clinic-context'
import { PatientsSummaryCards } from '@/components/patients/patients-summary-cards'
import {
  PatientsToolbar,
  type PatientsSortOption,
} from '@/components/patients/patients-toolbar'
import { PatientCard } from '@/components/patients/patient-card'
import { formatPatientCode, type PatientRow } from '@/components/patients/data'
import { cn } from '@/lib/utils'

const PAGE_SIZE_OPTIONS = ['8', '12', '24', '48']

interface PatientsViewProps {
  initialPatients: PatientRow[]
}

export function PatientsView({ initialPatients }: PatientsViewProps) {
  const router = useRouter()
  const { clinics, activeClinicId, isSuperAdmin } = useClinicContext()
  const [patients] = useState<PatientRow[]>(initialPatients)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<PatientsSortOption>('Recent')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [pageSize, setPageSize] = useState('8')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const rows = query
      ? patients.filter(
          (patient) =>
            patient.name.toLowerCase().includes(query) ||
            patient.address.toLowerCase().includes(query) ||
            formatPatientCode(patient.patientNumber)
              .toLowerCase()
              .includes(query),
        )
      : [...patients]

    switch (sort) {
      case 'Oldest':
        return rows.reverse()
      case 'Name (A–Z)':
        return rows.sort((a, b) => a.name.localeCompare(b.name))
      case 'Age (Oldest First)':
        return rows.sort((a, b) => b.age - a.age)
      case 'Recent':
      default:
        return rows
    }
  }, [patients, search, sort])

  const size = Number(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / size))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * size
  const visible = filtered.slice(start, start + size)

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleSortChange(value: PatientsSortOption) {
    setSort(value)
    setPage(1)
  }

  function handlePageSizeChange(value: string) {
    setPageSize(value)
    setPage(1)
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
            <Badge variant="purple">{patients.length} total patients</Badge>
          </div>
          {isSuperAdmin && activeClinicId && clinics.length > 0 && (
            <ClinicSelector clinics={clinics} activeClinicId={activeClinicId} />
          )}
        </div>
        <p className="text-muted-foreground">
          Browse and manage every patient registered at your clinic.
        </p>
      </div>

      <PatientsSummaryCards patients={patients} />

      <PatientsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        sort={sort}
        onSortChange={handleSortChange}
        view={view}
        onViewChange={setView}
        onNewClick={() => router.push('/patients/new')}
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground shadow-sm">
          No patients match your search.
        </div>
      ) : (
        <>
          <div
            className={cn(
              view === 'grid'
                ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'
                : 'flex flex-col gap-3',
            )}
          >
            {visible.map((patient) => (
              <PatientCard key={patient.id} patient={patient} view={view} />
            ))}
          </div>

          <div className="rounded-xl border bg-card shadow-sm">
            <Pagination
              className="border-t-0"
              page={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              totalCount={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </>
      )}
    </>
  )
}
