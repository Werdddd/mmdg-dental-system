import { Badge } from '@/components/ui/badge'

export interface WeeklyStat {
  label: string
  count: number
  height: string // e.g. "72%"
}

interface AppointmentStatisticsCardProps {
  weeklyStats: WeeklyStat[]
  totalThisWeek: number
}

export function AppointmentStatisticsCard({
  weeklyStats,
  totalThisWeek,
}: AppointmentStatisticsCardProps) {
  return (
    <div className="flex flex-col rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Appointment Statistics</h2>
          <p className="text-sm text-muted-foreground">This week</p>
        </div>
        <Badge variant="success">{totalThisWeek} this week</Badge>
      </div>

      <div className="mt-6 flex h-40 flex-1 items-end justify-between gap-2 rounded-lg bg-muted/40 p-4">
        {weeklyStats.map((bar) => (
          <div
            key={bar.label}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <div
              className="w-full max-w-[28px] rounded-md bg-primary/70 transition-all"
              style={{ height: bar.height }}
              title={`${bar.count} appointment${bar.count !== 1 ? 's' : ''}`}
            />
            <span className="text-xs text-muted-foreground">{bar.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-primary/70" />
          <span className="text-muted-foreground">Appointments per day</span>
        </div>
        <span className="font-medium">{totalThisWeek} total</span>
      </div>
    </div>
  )
}
