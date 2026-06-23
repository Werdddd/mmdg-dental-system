'use client'

import { useMemo, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'

import { type badgeVariants } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/status-badge'
import { cn } from '@/lib/utils'
import {
  formatToothLabel,
  LOWER_ARCH,
  UPPER_ARCH,
  type ToothCondition,
  type ToothRecord,
} from '@/components/patients/details/data'

const CONDITIONS: ToothCondition[] = [
  'Healthy',
  'Cavity',
  'Filled',
  'Crown',
  'Root Canal',
  'Missing',
]

const CONDITION_STYLE: Record<ToothCondition, string> = {
  Healthy: 'bg-muted text-muted-foreground border-border',
  Cavity:
    'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
  Filled:
    'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
  Crown:
    'bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/30',
  'Root Canal':
    'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30',
  Missing:
    'bg-slate-200 text-slate-500 border-slate-300 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/30',
}

const CONDITION_BADGE_VARIANT: Record<
  ToothCondition,
  VariantProps<typeof badgeVariants>['variant']
> = {
  Healthy: 'secondary',
  Cavity: 'warning',
  Filled: 'info',
  Crown: 'purple',
  'Root Canal': 'destructive',
  Missing: 'secondary',
}

interface DentalChartPanelProps {
  records: ToothRecord[]
}

export function DentalChartPanel({ records }: DentalChartPanelProps) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)

  const recordByTooth = useMemo(() => {
    const map = new Map<number, ToothRecord>()
    for (const record of records) map.set(record.tooth, record)
    return map
  }, [records])

  const recordedTeeth = useMemo(
    () => records.filter((record) => record.condition !== 'Healthy'),
    [records],
  )

  const selectedRecord =
    selectedTooth != null ? recordByTooth.get(selectedTooth) : undefined

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          {CONDITIONS.map((condition) => (
            <span key={condition} className="flex items-center gap-1.5">
              <span
                className={cn(
                  'size-3 rounded-sm border',
                  CONDITION_STYLE[condition],
                )}
              />
              {condition}
            </span>
          ))}
        </div>

        <p className="mb-1.5 text-center text-xs font-medium text-muted-foreground">
          Upper Arch
        </p>
        <div className="mb-3 flex justify-center gap-1.5 overflow-x-auto pb-1">
          {UPPER_ARCH.map((tooth) => {
            const condition = recordByTooth.get(tooth)?.condition ?? 'Healthy'
            return (
              <button
                key={tooth}
                type="button"
                aria-pressed={selectedTooth === tooth}
                onClick={() =>
                  setSelectedTooth((current) =>
                    current === tooth ? null : tooth,
                  )
                }
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition-colors',
                  CONDITION_STYLE[condition],
                  selectedTooth === tooth &&
                    'ring-2 ring-primary ring-offset-2 ring-offset-card',
                )}
              >
                {tooth}
              </button>
            )
          })}
        </div>

        <div className="flex justify-center gap-1.5 overflow-x-auto pb-1">
          {LOWER_ARCH.map((tooth) => {
            const condition = recordByTooth.get(tooth)?.condition ?? 'Healthy'
            return (
              <button
                key={tooth}
                type="button"
                aria-pressed={selectedTooth === tooth}
                onClick={() =>
                  setSelectedTooth((current) =>
                    current === tooth ? null : tooth,
                  )
                }
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition-colors',
                  CONDITION_STYLE[condition],
                  selectedTooth === tooth &&
                    'ring-2 ring-primary ring-offset-2 ring-offset-card',
                )}
              >
                {tooth}
              </button>
            )
          })}
        </div>
        <p className="mt-1.5 text-center text-xs font-medium text-muted-foreground">
          Lower Arch
        </p>

        {selectedTooth != null && (
          <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm">
            <p className="font-medium">{formatToothLabel(selectedTooth)}</p>
            {selectedRecord && selectedRecord.condition !== 'Healthy' ? (
              <div className="mt-2 grid grid-cols-2 gap-2 text-muted-foreground sm:grid-cols-4">
                <span>
                  Condition:{' '}
                  <span className="text-foreground">
                    {selectedRecord.condition}
                  </span>
                </span>
                <span>
                  Treatment:{' '}
                  <span className="text-foreground">
                    {selectedRecord.treatmentPerformed}
                  </span>
                </span>
                <span>
                  Last Updated:{' '}
                  <span className="text-foreground">
                    {selectedRecord.lastUpdated}
                  </span>
                </span>
                <span>
                  Dentist:{' '}
                  <span className="text-foreground">
                    {selectedRecord.dentist}
                  </span>
                </span>
              </div>
            ) : (
              <p className="mt-1 text-muted-foreground">
                No issues recorded for this tooth.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Tooth Number</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Treatment Performed</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Dentist</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recordedTeeth.length === 0 && (
              <TableEmpty colSpan={6}>
                No tooth conditions have been recorded yet.
              </TableEmpty>
            )}
            {recordedTeeth.map((record) => (
              <TableRow
                key={record.tooth}
                className={cn(
                  'cursor-pointer',
                  record.tooth === selectedTooth && 'bg-primary/5',
                )}
                onClick={() =>
                  setSelectedTooth((current) =>
                    current === record.tooth ? null : record.tooth,
                  )
                }
              >
                <TableCell className="font-medium whitespace-nowrap">
                  {formatToothLabel(record.tooth)}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={record.condition}
                    variants={CONDITION_BADGE_VARIANT}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {record.treatmentPerformed}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {record.lastUpdated}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {record.dentist}
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(event) => event.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Tooth record actions"
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>View record</DropdownMenuItem>
                      <DropdownMenuItem>Update record</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
