'use client'

import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/shared/pagination'
import { ClinicSelector } from '@/components/layout/clinic-selector'
import { useClinicContext } from '@/components/layout/clinic-context'
import { AddAppointmentDialog } from '@/components/appointments/add-appointment-dialog'
import { AppointmentDetailsDialog } from '@/components/appointments/appointment-details-dialog'
import { AppointmentsSummaryCards } from '@/components/appointments/appointments-summary-cards'
import {
  AppointmentsToolbar,
  type SortOption,
} from '@/components/appointments/appointments-toolbar'
import { AppointmentsTable } from '@/components/appointments/appointments-table'
import { type AppointmentRow } from '@/components/appointments/data'
import type { PatientRow } from '@/components/patients/data'
import type { DentistOption } from '@/lib/data/dentists'

const PAGE_SIZE_OPTIONS = ['5', '10', '25', '50']

interface AppointmentsViewProps {
  initialAppointments: AppointmentRow[]
  patients: PatientRow[]
  dentists: DentistOption[]
}

export function AppointmentsView({
  initialAppointments,
  patients,
  dentists,
}: AppointmentsViewProps) {
  const { clinics, activeClinicId } = useClinicContext()
  const [appointments, setAppointments] =
    useState<AppointmentRow[]>(initialAppointments)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('Recent')
  const [pageSize, setPageSize] = useState('10')
  const [page, setPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentRow | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const rows = query
      ? appointments.filter(
          (appt) =>
            appt.patient.name.toLowerCase().includes(query) ||
            appt.dentist.name.toLowerCase().includes(query),
        )
      : [...appointments]

    switch (sort) {
      case 'Oldest':
        return rows.reverse()
      case 'Patient (A–Z)':
        return rows.sort((a, b) => a.patient.name.localeCompare(b.patient.name))
      case 'Status':
        return rows.sort((a, b) => a.status.localeCompare(b.status))
      case 'Recent':
      default:
        return rows
    }
  }, [appointments, search, sort])

  const size = Number(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / size))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * size
  const visible = filtered.slice(start, start + size)

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleSortChange(value: SortOption) {
    setSort(value)
    setPage(1)
  }

  function handlePageSizeChange(value: string) {
    setPageSize(value)
    setPage(1)
  }

  function handleAddAppointment(appointment: AppointmentRow) {
    setAppointments((prev) => [appointment, ...prev])
    setPage(1)
  }

  function handleRowClick(appointment: AppointmentRow) {
    setSelectedAppointment(appointment)
    setDetailsOpen(true)
  }

  function handleStatusChanged(updated: AppointmentRow, newAppointment?: AppointmentRow) {
    setAppointments((prev) => {
      const replaced = prev.map((a) => (a.id === updated.id ? updated : a))
      return newAppointment ? [newAppointment, ...replaced] : replaced
    })
    setSelectedAppointment(updated)
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Appointments
            </h1>
            <Badge variant="purple">
              {appointments.length} total appointments
            </Badge>
          </div>
          {activeClinicId && clinics.length > 1 && (
            <ClinicSelector clinics={clinics} activeClinicId={activeClinicId} />
          )}
        </div>
        <p className="text-muted-foreground">
          Manage upcoming, ongoing, and past patient appointments.
        </p>
      </div>

      <AppointmentsSummaryCards appointments={appointments} />

      <AppointmentsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        sort={sort}
        onSortChange={handleSortChange}
        onNewClick={() => setAddOpen(true)}
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <AppointmentsTable appointments={visible} onRowClick={handleRowClick} />

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          totalCount={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      <AddAppointmentDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        patients={patients}
        dentists={dentists}
        onAdd={handleAddAppointment}
      />

      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        allAppointments={appointments}
        onStatusChanged={handleStatusChanged}
      />
    </>
  )
}
