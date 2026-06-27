'use client'

import { useState } from 'react'

import { AppointmentsTable } from '@/components/appointments/appointments-table'
import { AppointmentDetailsDialog } from '@/components/appointments/appointment-details-dialog'
import type { AppointmentRow } from '@/components/appointments/data'

interface RecentAppointmentsTableProps {
  appointments: AppointmentRow[]
}

export function RecentAppointmentsTable({
  appointments: initialAppointments,
}: RecentAppointmentsTableProps) {
  const [appointments, setAppointments] =
    useState<AppointmentRow[]>(initialAppointments)
  const [selected, setSelected] = useState<AppointmentRow | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  function handleRowClick(appointment: AppointmentRow) {
    setSelected(appointment)
    setDetailsOpen(true)
  }

  function handleStatusChanged(updated: AppointmentRow) {
    setAppointments((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a)),
    )
    setSelected(updated)
  }

  return (
    <div className="flex h-[32rem] flex-col rounded-xl border bg-card shadow-sm">
      <div className="flex shrink-0 items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">Recent Appointments</h2>
          <p className="text-sm text-muted-foreground">
            Today and upcoming visits
          </p>
        </div>
        <a
          href="/appointments"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </a>
      </div>

      <AppointmentsTable
        appointments={appointments}
        onRowClick={handleRowClick}
        containerClassName="min-h-0 flex-1 overflow-y-auto"
        stickyHeader
      />

      <AppointmentDetailsDialog
        appointment={selected}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        allAppointments={appointments}
        onStatusChanged={handleStatusChanged}
      />
    </div>
  )
}
