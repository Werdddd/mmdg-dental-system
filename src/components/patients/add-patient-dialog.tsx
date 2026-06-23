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
import { addPatientAction } from '@/app/(app)/patients/actions'

const GENDERS: PatientRow['gender'][] = ['Male', 'Female']

interface AddPatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (patient: PatientRow) => void
}

export function AddPatientDialog({
  open,
  onOpenChange,
  onAdd,
}: AddPatientDialogProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState<PatientRow['gender']>('Female')
  const [address, setAddress] = useState('')
  const [birthday, setBirthday] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setName('')
    setPhone('')
    setGender('Female')
    setAddress('')
    setBirthday('')
    setError(null)
  }

  const canSubmit =
    name.trim().length > 0 &&
    phone.trim().length > 0 &&
    address.trim().length > 0 &&
    birthday.length > 0 &&
    !isSubmitting

  async function handleSubmit() {
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)
    try {
      const patient = await addPatientAction({
        fullName: name.trim(),
        phone: phone.trim(),
        gender,
        birthday,
        address: address.trim(),
      })
      onAdd(patient)
      resetForm()
      onOpenChange(false)
    } catch {
      setError('Could not add patient. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
              <label className="mb-1.5 block text-sm font-medium">
                Contact Number
              </label>
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+63 912 345 6789"
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

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? 'Adding…' : 'Add Patient'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
