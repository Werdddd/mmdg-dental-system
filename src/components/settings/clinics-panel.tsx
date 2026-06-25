'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, MoreHorizontal, Plus } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import type { ClinicRecord } from '@/lib/data/clinics'
import type { StaffUser } from '@/lib/data/staff'
import { addClinicAction, deleteClinicAction } from '@/app/(app)/settings/actions'

interface ClinicsPanelProps {
  clinics: ClinicRecord[]
  staff: StaffUser[]
}

export function ClinicsPanel({ clinics, staff }: ClinicsPanelProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  function staffCount(clinicId: string) {
    return staff.filter((u) => u.clinicId === clinicId).length
  }

  function resetForm() {
    setName('')
    setFormError(null)
  }

  function handleAdd() {
    if (!name.trim()) return
    setFormError(null)
    startTransition(async () => {
      const result = await addClinicAction(name.trim())
      if (result.error) {
        setFormError(result.error)
        return
      }
      resetForm()
      setOpen(false)
      router.refresh()
    })
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      const result = await deleteClinicAction(id)
      if (result.error) alert(result.error)
      else router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Clinics</h2>
          <p className="text-sm text-muted-foreground">
            Manage clinic branches that Admins and Dentists can be assigned to.
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (!next) resetForm()
          }}
        >
          <DialogTrigger className={buttonVariants({ className: 'gap-1.5' })}>
            <Plus className="size-4" />
            Add Clinic
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Clinic</DialogTitle>
              <DialogDescription>
                Add a new clinic branch. Staff can then be assigned to it.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Clinic Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. MMDG Dental — Pasig"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
              </div>
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!name.trim() || isPending}
              >
                {isPending ? 'Adding…' : 'Add Clinic'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Clinic</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clinics.length === 0 && (
              <TableEmpty colSpan={3}>
                No clinics yet. Add your first clinic to get started.
              </TableEmpty>
            )}
            {clinics.map((clinic) => (
              <TableRow key={clinic.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="size-4" />
                    </div>
                    <span className="font-medium whitespace-nowrap">
                      {clinic.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {staffCount(clinic.id)} staff
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Clinic actions"
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="text-destructive data-[highlighted]:text-destructive"
                        onClick={() => handleRemove(clinic.id)}
                      >
                        Remove clinic
                      </DropdownMenuItem>
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
