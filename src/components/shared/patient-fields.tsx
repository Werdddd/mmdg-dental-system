'use client'

import { Input } from '@/components/ui/input'

interface PatientFieldsProps {
  name: string
  onNameChange: (value: string) => void
  phone: string
  onPhoneChange: (value: string) => void
}

export function PatientFields({
  name,
  onNameChange,
  phone,
  onPhoneChange,
}: PatientFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Patient Name</label>
        <Input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Juan Dela Cruz"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Contact Number
        </label>
        <Input
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
          placeholder="+63 912 345 6789"
        />
      </div>
    </div>
  )
}
