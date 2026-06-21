'use client'

import { useState } from 'react'
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
import type { Clinic } from '@/components/settings/clinics-data'
import { ALLOWED_USERS } from '@/components/settings/users-data'

interface ClinicsPanelProps {
  clinics: Clinic[]
  onClinicsChange: (clinics: Clinic[]) => void
}

export function ClinicsPanel({ clinics, onClinicsChange }: ClinicsPanelProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')

  function resetForm() {
    setName('')
    setAddress('')
    setPhone('')
  }

  function handleAddClinic() {
    if (!name.trim() || !address.trim()) return
    onClinicsChange([
      ...clinics,
      {
        id: `clinic-${Date.now()}`,
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
      },
    ])
    resetForm()
    setOpen(false)
  }

  function handleRemoveClinic(id: string) {
    onClinicsChange(clinics.filter((clinic) => clinic.id !== id))
  }

  function staffCount(clinicId: string) {
    return ALLOWED_USERS.filter((user) => user.clinicId === clinicId).length
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
                Add a new clinic branch staff can be assigned to.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Clinic Name
                </label>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. MMDG Dental — Pasig"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Address
                </label>
                <Input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Street, City, Province"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Phone
                </label>
                <Input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+63 2 8000 0000"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddClinic}
                disabled={!name.trim() || !address.trim()}
              >
                Add Clinic
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
              <TableHead>Address</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clinics.length === 0 && (
              <TableEmpty colSpan={5}>
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
                <TableCell className="text-muted-foreground">
                  {clinic.address}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {clinic.phone}
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
                      <DropdownMenuItem>Edit clinic</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive data-[highlighted]:text-destructive"
                        onClick={() => handleRemoveClinic(clinic.id)}
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
