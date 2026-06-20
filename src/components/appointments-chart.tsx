'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const sampleData = [
  { month: 'Jan', appointments: 42 },
  { month: 'Feb', appointments: 38 },
  { month: 'Mar', appointments: 55 },
  { month: 'Apr', appointments: 48 },
  { month: 'May', appointments: 61 },
  { month: 'Jun', appointments: 57 },
]

export default function AppointmentsChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sampleData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar
          dataKey="appointments"
          fill="var(--chart-1)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
