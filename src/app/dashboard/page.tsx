import { CalendarDays, Clock, Users } from 'lucide-react'

import { Sidebar } from '@/components/dashboard/sidebar'
import { TopNavbar } from '@/components/dashboard/top-navbar'
import { StatCard } from '@/components/dashboard/stat-card'
import { RecentAppointmentsTable } from '@/components/dashboard/recent-appointments-table'
import { CalendarCard } from '@/components/dashboard/calendar-card'
import { AppointmentStatisticsCard } from '@/components/dashboard/appointment-statistics-card'
import { RecentActivityCard } from '@/components/dashboard/recent-activity-card'
import { QuickActionsCard } from '@/components/dashboard/quick-actions-card'

export default function DashboardPage() {
  return (
    <div className="min-h-svh bg-muted/30">
      <Sidebar />

      <div className="flex min-h-svh flex-col lg:pl-64">
        <TopNavbar />

        <main className="flex-1 space-y-6 p-4 sm:p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Good morning, Dr. Reyes
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening at your clinic today.
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Today's Appointments"
              value="18"
              icon={CalendarDays}
              trend={{ direction: 'up', value: '8%' }}
              helperText="vs yesterday"
            />
            <StatCard
              label="Total Patients"
              value="1,284"
              icon={Users}
              trend={{ direction: 'up', value: '3.2%' }}
              helperText="this month"
            />
            <StatCard
              label="Pending Requests"
              value="6"
              icon={Clock}
              trend={{ direction: 'down', value: '2' }}
              helperText="since yesterday"
            />
          </div>

          {/* Appointments table + calendar */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentAppointmentsTable />
            </div>
            <CalendarCard />
          </div>

          {/* Statistics, activity, quick actions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <AppointmentStatisticsCard />
            <RecentActivityCard />
            <QuickActionsCard />
          </div>
        </main>
      </div>
    </div>
  )
}
