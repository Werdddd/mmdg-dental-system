'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
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
import { ClinicCard } from '@/components/clinics/clinic-card'
import type { ClinicRecord } from '@/lib/data/clinics'
import { addClinicAction, deleteClinicAction } from '@/app/(app)/clinics/actions'

interface ClinicsViewProps {
  clinics: ClinicRecord[]
  staffCountByClinic: Record<string, number>
  revenueByClinic: Record<string, number>
}

export function ClinicsView({
  clinics,
  staffCountByClinic,
  revenueByClinic,
}: ClinicsViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return clinics
    return clinics.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.address ?? '').toLowerCase().includes(q),
    )
  }, [search, clinics])

  function resetForm() {
    setName('')
    setAddress('')
    setFormError(null)
  }

  function handleAdd() {
    if (!name.trim()) return
    setFormError(null)
    startTransition(async () => {
      const result = await addClinicAction(name.trim(), address.trim())
      if (result.error) {
        setFormError(result.error)
        return
      }
      resetForm()
      setOpen(false)
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Remove this clinic? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteClinicAction(id)
      if (result.error) alert(result.error)
      else router.refresh()
    })
  }

  return (
    <>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Clinics</h1>
          <Badge variant="purple">{clinics.length} total clinics</Badge>
        </div>
        <p className="text-muted-foreground">
          Manage clinic branches, their staff, and revenue.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clinics…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Address
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 123 Ortigas Ave, Pasig City"
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
              <Button onClick={handleAdd} disabled={!name.trim() || isPending}>
                {isPending ? 'Adding…' : 'Add Clinic'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground shadow-sm">
          {clinics.length === 0 ? (
            <div className="flex flex-col items-center gap-2">
              <Building2 className="size-8 text-muted-foreground/50" />
              No clinics yet. Add your first clinic to get started.
            </div>
          ) : (
            'No clinics match your search.'
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((clinic) => (
            <ClinicCard
              key={clinic.id}
              clinic={clinic}
              staffCount={staffCountByClinic[clinic.id] ?? 0}
              revenue={revenueByClinic[clinic.id] ?? 0}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </>
  )
}
