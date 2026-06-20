import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  trend?: {
    direction: 'up' | 'down'
    value: string
  }
  helperText?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  helperText,
}: StatCardProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {(trend || helperText) && (
          <div className="flex items-center gap-1.5 text-xs">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-medium',
                  trend.direction === 'up'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-destructive',
                )}
              >
                {trend.direction === 'up' ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                {trend.value}
              </span>
            )}
            {helperText && (
              <span className="text-muted-foreground">{helperText}</span>
            )}
          </div>
        )}
      </div>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
    </div>
  )
}
