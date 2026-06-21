'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PatientRow } from '@/components/patients/data'
import {
  initialsOf,
  MOCK_TODAY,
  formatMonthDay,
  nextSequentialId,
} from '@/lib/utils'

const GENDERS: PatientRow['gender'][] = ['Male', 'Female']

interface AddPatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patients: PatientRow[]
  onAdd: (patient: PatientRow) => void
}

export function AddPatientDialog({
  open,
  onOpenChange,
  patients,
  onAdd,
}: AddPatientDialogProps) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<PatientRow['gender']>('Female')
  const [address, setAddress] = useState('')
  const [birthday, setBirthday] = useState('')

  function resetForm() {
    setName('')
    setAge('')
    setGender('Female')
    setAddress('')
    setBirthday('')
  }

  const canSubmit =
    name.trim().length > 0 &&
    age.trim().length > 0 &&
    Number(age) > 0 &&
    address.trim().length > 0 &&
    birthday.length > 0

  function handleSubmit() {
    if (!canSubmit) return

    onAdd({
      id: nextSequentialId(patients, (p) => p.id, 'pat-'),
      name: name.trim(),
      initials: initialsOf(name),
      age: Number(age),
      gender,
      lastAppointment: MOCK_TODAY,
      lastAppointmentReason: 'Initial Consultation',
      address: address.trim(),
      registeredDate: MOCK_TODAY,
      treatmentStatus: 'Active',
      birthday: formatMonthDay(birthday),
    })
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) resetForm()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Patient</DialogTitle>
          <DialogDescription>
            Register a new patient at your clinic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Full Name
            </label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Juan Dela Cruz"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Age</label>
              <Input
                type="number"
                min={0}
                value={age}
                onChange={(event) => setAge(event.target.value)}
                placeholder="34"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Gender</label>
              <Select
                value={gender}
                onValueChange={(value) =>
                  value && setGender(value as PatientRow['gender'])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Birthday</label>
            <Input
              type="date"
              value={birthday}
              onChange={(event) => setBirthday(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Address</label>
            <Input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Quezon City, Metro Manila"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Add Patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
