'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, MoreHorizontal, Pencil } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'

import { type badgeVariants } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  TOOTH_CONDITIONS,
  UPPER_ARCH,
  type ToothCondition,
} from '@/lib/dental/teeth'
import { CLINIC_BRANCHES, type ClinicBranch } from '@/lib/dental/branches'
import type { ToothRecord } from '@/lib/data/dental-chart'
import type { ToothPhoto } from '@/lib/data/dental-chart-photos'
import type { DentistOption } from '@/lib/data/dentists'
import { ToothRecordDialog } from '@/components/patients/details/tooth-record-dialog'
import { DentalChartPhotos } from '@/components/patients/details/dental-chart-photos'
import {
  addPatientBranchAction,
  removePatientBranchAction,
} from '@/app/(app)/patients/actions'

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

interface BranchTagsRowProps {
  patientId: string
  activeBranches: ClinicBranch[]
}

function BranchTagsRow({ patientId, activeBranches }: BranchTagsRowProps) {
  const router = useRouter()
  const [pending, setPending] = useState<ClinicBranch | null>(null)
  const [error, setError] = useState<string | null>(null)
  const active = useMemo(() => new Set(activeBranches), [activeBranches])

  async function toggle(branch: ClinicBranch) {
    setPending(branch)
    setError(null)
    try {
      if (active.has(branch)) {
        await removePatientBranchAction(patientId, branch)
      } else {
        await addPatientBranchAction(patientId, branch)
      }
      router.refresh()
    } catch {
      setError('Could not update treatment branches. Please try again.')
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Treatment Branches:
        </span>
        {CLINIC_BRANCHES.map((branch) => {
          const isActive = active.has(branch)
          return (
            <button
              key={branch}
              type="button"
              aria-pressed={isActive}
              onClick={() => toggle(branch)}
              disabled={pending === branch}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {isActive && <Check className="size-3" />}
              {pending === branch ? 'Saving…' : branch}
            </button>
          )
        })}
      </div>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface DentalChartPanelProps {
  patientId: string
  records: ToothRecord[]
  branches: ClinicBranch[]
  photos: ToothPhoto[]
  dentists: DentistOption[]
}

export function DentalChartPanel({
  patientId,
  records,
  branches,
  photos,
  dentists,
}: DentalChartPanelProps) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [editingTooth, setEditingTooth] = useState<number | null>(null)

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
        <BranchTagsRow patientId={patientId} activeBranches={branches} />

        <div className="my-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          {TOOTH_CONDITIONS.map((condition) => (
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

        {selectedTooth != null && selectedRecord && (
          <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{formatToothLabel(selectedTooth)}</p>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setEditingTooth(selectedTooth)}
              >
                <Pencil className="size-3.5" />
                Edit Record
              </Button>
            </div>
            {selectedRecord.condition !== 'Healthy' ? (
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
            {selectedRecord.notes && (
              <p className="mt-2 text-muted-foreground">
                Notes:{' '}
                <span className="text-foreground">{selectedRecord.notes}</span>
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
                      <DropdownMenuItem
                        onClick={() => setSelectedTooth(record.tooth)}
                      >
                        View Record
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEditingTooth(record.tooth)}
                      >
                        Edit Record
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DentalChartPhotos
        patientId={patientId}
        photos={photos}
        defaultTooth={selectedTooth}
      />

      <ToothRecordDialog
        patientId={patientId}
        tooth={editingTooth}
        record={editingTooth != null ? recordByTooth.get(editingTooth) : undefined}
        dentists={dentists}
        open={editingTooth != null}
        onOpenChange={(open) => !open && setEditingTooth(null)}
      />
    </div>
  )
}
