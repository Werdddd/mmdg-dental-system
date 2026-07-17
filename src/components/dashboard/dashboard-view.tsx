'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, CalendarDays, CheckCircle, Clock, Users } from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import { RecentAppointmentsTable } from '@/components/dashboard/recent-appointments-table'
import { CalendarCard } from '@/components/dashboard/calendar-card'
import { AppointmentStatisticsCard } from '@/components/dashboard/appointment-statistics-card'
import { RecentActivityCard } from '@/components/dashboard/recent-activity-card'
import { QuickActionsCard } from '@/components/dashboard/quick-actions-card'
import { AddAppointmentDialog } from '@/components/appointments/add-appointment-dialog'
import { AddInvoiceDialog } from '@/components/invoices/add-invoice-dialog'
import { AddPaymentDialog } from '@/components/payments/add-payment-dialog'
import { ClinicSelector } from '@/components/layout/clinic-selector'
import { useClinicContext } from '@/components/layout/clinic-context'
import type { AppointmentRow } from '@/components/appointments/data'
import type { PatientRow } from '@/components/patients/data'
import type { InvoiceRow } from '@/components/invoices/data'
import type { DentistOption } from '@/lib/data/dentists'
import type { TreatmentRecordRow } from '@/lib/data/treatment-records'

// ── helpers ──────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function isoDateOf(iso: string) {
  return iso.slice(0, 10)
}

function buildWeeklyStats(appointments: AppointmentRow[]) {
  const now = new Date()
  const dow = now.getDay() // 0=Sun
  const offset = dow === 0 ? -6 : 1 - dow
  const monday = new Date(now)
  monday.setDate(now.getDate() + offset)
  monday.setHours(0, 0, 0, 0)

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const counts = DAYS.map((label, i) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    const dateStr = day.toISOString().slice(0, 10)
    return {
      label,
      count: appointments.filter((a) => isoDateOf(a.scheduledAt) === dateStr)
        .length,
    }
  })

  const max = Math.max(...counts.map((c) => c.count), 1)
  return counts.map((c) => ({
    label: c.label,
    count: c.count,
    height: `${Math.max(4, Math.round((c.count / max) * 100))}%`,
  }))
}

// ── component ─────────────────────────────────────────────────────────────────

interface DashboardViewProps {
  appointments: AppointmentRow[]
  allAppointments: AppointmentRow[]
  patients: PatientRow[]
  dentists: DentistOption[]
  invoicesWithBalance: InvoiceRow[]
  pendingTreatments: TreatmentRecordRow[]
  profileName: string
}

export function DashboardView({
  appointments,
  allAppointments,
  patients,
  dentists,
  invoicesWithBalance,
  pendingTreatments,
  profileName,
}: DashboardViewProps) {
  const { clinics, activeClinicId } = useClinicContext()
  const router = useRouter()

  // Dialog states
  const [apptOpen, setApptOpen] = useState(false)
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)

  // Stats
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const todayCount = useMemo(
    () => appointments.filter((a) => isoDateOf(a.scheduledAt) === today).length,
    [appointments, today],
  )

  const confirmedCount = useMemo(
    () => appointments.filter((a) => a.status === 'Scheduled').length,
    [appointments],
  )

  const completedCount = useMemo(
    () => appointments.filter((a) => a.status === 'Completed').length,
    [appointments],
  )

  const weeklyStats = useMemo(
    () => buildWeeklyStats(appointments),
    [appointments],
  )
  const totalThisWeek = useMemo(
    () => weeklyStats.reduce((sum, d) => sum + d.count, 0),
    [weeklyStats],
  )

  const recentAppointments = useMemo(
    () => appointments.slice(0, 9),
    [appointments],
  )

  const firstName = profileName.split(' ')[0] ?? 'Doctor'
  const activeClinicName = clinics.find((c) => c.id === activeClinicId)?.name

  return (
    <>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {greeting()}, {firstName}
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening at your clinic today.
            </p>
          </div>
          {activeClinicId && clinics.length > 1 && (
            <ClinicSelector clinics={clinics} activeClinicId={activeClinicId} />
          )}
          {activeClinicId && clinics.length <= 1 && activeClinicName && (
            <div className="flex h-9 shrink-0 items-center gap-2 rounded-md border border-dashed px-3 text-sm font-medium text-muted-foreground">
              <Building2 className="size-4 shrink-0" />
              {activeClinicName}
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's Appointments"
          value={String(todayCount)}
          icon={CalendarDays}
          helperText="scheduled for today"
        />
        <StatCard
          label="Total Patients"
          value={patients.length.toLocaleString()}
          icon={Users}
          helperText="registered at this clinic"
        />
        <StatCard
          label="Scheduled"
          value={String(confirmedCount)}
          icon={Clock}
          helperText="upcoming appointments"
        />
        <StatCard
          label="Completed"
          value={String(completedCount)}
          icon={CheckCircle}
          helperText="all time"
        />
      </div>

      {/* Appointments table + calendar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentAppointmentsTable appointments={recentAppointments} />
        </div>
        <CalendarCard
          appointments={allAppointments}
          patients={patients}
          dentists={dentists}
        />
      </div>

      {/* Statistics + activity + quick actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AppointmentStatisticsCard
          weeklyStats={weeklyStats}
          totalThisWeek={totalThisWeek}
        />
        <RecentActivityCard appointments={recentAppointments} />
        <QuickActionsCard
          onNewAppointment={() => setApptOpen(true)}
          onAddPatient={() => router.push('/patients/new')}
          onNewInvoice={() => setInvoiceOpen(true)}
          onNewPayment={() => setPaymentOpen(true)}
        />
      </div>

      {/* Dialogs */}
      <AddAppointmentDialog
        open={apptOpen}
        onOpenChange={setApptOpen}
        patients={patients}
        dentists={dentists}
        onAdd={() => setApptOpen(false)}
      />
      <AddInvoiceDialog
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
        patients={patients}
        pendingTreatments={pendingTreatments}
        onAdd={() => setInvoiceOpen(false)}
      />
      <AddPaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        invoices={invoicesWithBalance}
        onAdd={() => setPaymentOpen(false)}
      />
    </>
  )
}
