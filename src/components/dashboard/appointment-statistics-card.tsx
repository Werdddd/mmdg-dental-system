import { Badge } from '@/components/ui/badge'

// Decorative placeholder bars only — no chart library, no computed data.
const BARS = [
  { label: 'Mon', height: '40%' },
  { label: 'Tue', height: '65%' },
  { label: 'Wed', height: '50%' },
  { label: 'Thu', height: '80%' },
  { label: 'Fri', height: '95%' },
  { label: 'Sat', height: '60%' },
  { label: 'Sun', height: '30%' },
]

export function AppointmentStatisticsCard() {
  return (
    <div className="flex flex-col rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Appointment Statistics</h2>
          <p className="text-sm text-muted-foreground">This week</p>
        </div>
        <Badge variant="success">+12% vs last week</Badge>
      </div>

      {/* Chart placeholder — to be replaced with a real chart component later */}
      <div className="mt-6 flex h-40 flex-1 items-end justify-between gap-2 rounded-lg bg-muted/40 p-4">
        {BARS.map((bar) => (
          <div
            key={bar.label}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <div
              className="w-full max-w-[28px] rounded-md bg-primary/70"
              style={{ height: bar.height }}
            />
            <span className="text-xs text-muted-foreground">{bar.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-primary/70" />
          <span className="text-muted-foreground">Completed appointments</span>
        </div>
        <span className="font-medium">128 total</span>
      </div>
    </div>
  )
}
