'use client'

import dynamic from 'next/dynamic'

const AppointmentsChart = dynamic(
  () => import('@/components/appointments-chart'),
  { ssr: false },
)

export function ChartSection() {
  return <AppointmentsChart />
}
