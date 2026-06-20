import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// Static placeholder grid for June 2026 — display only, no date logic.
const WEEKS: (number | null)[][] = [
  [null, 1, 2, 3, 4, 5, 6],
  [7, 8, 9, 10, 11, 12, 13],
  [14, 15, 16, 17, 18, 19, 20],
  [21, 22, 23, 24, 25, 26, 27],
  [28, 29, 30, null, null, null, null],
]

const TODAY = 20
const MARKED_DAYS = new Set([9, 14, 20, 24])

const UPCOMING = [
  { label: 'Annual checkup — Liza Fernandez', time: 'Today · 1:15 PM' },
  { label: 'Braces adjustment — Ana Lim', time: 'Tomorrow · 3:30 PM' },
  { label: 'Consultation — Mark Tan', time: 'Jun 24 · 9:00 AM' },
]

export function CalendarCard() {
  return (
    <div className="flex h-[32rem] flex-col rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-base font-semibold">June 2026</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className="mt-4 w-full table-fixed border-collapse text-center text-xs">
          <thead>
            <tr className="text-muted-foreground">
              {WEEKDAYS.map((day) => (
                <th key={day} className="pb-2 font-medium">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WEEKS.map((week, weekIdx) => (
              <tr key={weekIdx}>
                {week.map((day, dayIdx) => (
                  <td key={dayIdx} className="py-1">
                    {day && (
                      <div
                        className={cn(
                          'relative mx-auto flex size-7 items-center justify-center rounded-full',
                          day === TODAY
                            ? 'bg-primary font-semibold text-primary-foreground'
                            : 'text-foreground hover:bg-muted',
                        )}
                      >
                        {day}
                        {MARKED_DAYS.has(day) && day !== TODAY && (
                          <span className="absolute bottom-0.5 size-1 rounded-full bg-primary" />
                        )}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Upcoming</h3>
            <Badge variant="secondary">{UPCOMING.length} scheduled</Badge>
          </div>
          <ul className="space-y-3">
            {UPCOMING.map((item) => (
              <li key={item.label} className="flex items-start gap-2.5 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
