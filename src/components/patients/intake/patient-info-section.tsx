import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  PatientRow,
  PreferredContactMethod,
} from '@/components/patients/data'
import { Field, SectionLabel } from '@/components/patients/intake/form-controls'
import { PatientPhotoField } from '@/components/patients/intake/patient-photo-field'
import type { PatientIntakeFormValues } from '@/components/patients/intake/types'
import { initialsOf } from '@/lib/utils'

const GENDERS: PatientRow['gender'][] = ['Male', 'Female']
const CIVIL_STATUSES = ['Single', 'Married', 'Widowed', 'Separated']
const EMERGENCY_RELATIONS = [
  'Spouse',
  'Parent',
  'Sibling',
  'Child',
  'Guardian',
  'Friend',
  'Other',
]
const PREFERRED_CONTACT_METHODS: PreferredContactMethod[] = [
  'SMS',
  'Phone Call',
  'Email',
  'Facebook Messenger',
  'WhatsApp',
  'Viber',
  'Other',
]

interface PatientInfoSectionProps {
  values: PatientIntakeFormValues
  onChange: (patch: Partial<PatientIntakeFormValues>) => void
  existingPhotoUrl?: string
}

export function PatientInfoSection({
  values,
  onChange,
  existingPhotoUrl,
}: PatientInfoSectionProps) {
  return (
    <div className="space-y-5">
      <PatientPhotoField
        file={values.photoFile}
        removed={values.photoRemoved}
        existingUrl={existingPhotoUrl}
        initials={initialsOf(`${values.firstName} ${values.lastName}`.trim())}
        onFileChange={(photoFile) =>
          onChange({ photoFile, photoRemoved: false })
        }
        onRemove={() => onChange({ photoFile: null, photoRemoved: true })}
      />

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="First Name">
            <Input
              value={values.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              placeholder="Juan"
            />
          </Field>
          <Field label="Middle Name" optional>
            <Input
              value={values.middleName}
              onChange={(e) => onChange({ middleName: e.target.value })}
              placeholder="Santos"
            />
          </Field>
          <Field label="Last Name">
            <Input
              value={values.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              placeholder="Dela Cruz"
            />
          </Field>
          <Field label="Suffix" optional>
            <Input
              value={values.suffix}
              onChange={(e) => onChange({ suffix: e.target.value })}
              placeholder="Jr., III"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date of Birth">
            <Input
              type="date"
              value={values.birthday}
              onChange={(e) => onChange({ birthday: e.target.value })}
            />
          </Field>
          <Field label="Sex">
            <Select
              value={values.gender}
              onValueChange={(value) =>
                value && onChange({ gender: value as PatientRow['gender'] })
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
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Civil Status" optional>
            <Select
              value={values.civilStatus}
              onValueChange={(value) =>
                value && onChange({ civilStatus: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {CIVIL_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nationality" optional>
            <Input
              value={values.nationality}
              onChange={(e) => onChange({ nationality: e.target.value })}
              placeholder="Filipino"
            />
          </Field>
        </div>

        <Field label="Occupation" optional>
          <Input
            value={values.occupation}
            onChange={(e) => onChange({ occupation: e.target.value })}
            placeholder="e.g. Teacher"
          />
        </Field>

        <Field label="Home Address">
          <Input
            value={values.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="Quezon City, Metro Manila"
          />
        </Field>
      </div>

      <div className="space-y-4">
        <SectionLabel>Contact</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email Address" optional>
            <Input
              type="email"
              value={values.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="juan@example.com"
            />
          </Field>
          <Field label="Mobile Number">
            <Input
              value={values.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+63 912 345 6789"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Telephone Number" optional>
            <Input
              value={values.telephoneNumber}
              onChange={(e) => onChange({ telephoneNumber: e.target.value })}
              placeholder="(02) 8123 4567"
            />
          </Field>
          <Field label="Preferred Contact Method" optional>
            <Select
              value={values.preferredContactMethod}
              onValueChange={(value) =>
                value &&
                onChange({
                  preferredContactMethod: value as PreferredContactMethod,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {PREFERRED_CONTACT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      <div className="space-y-4">
        <SectionLabel>Emergency Contact</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name" optional>
            <Input
              value={values.emergencyContactName}
              onChange={(e) =>
                onChange({ emergencyContactName: e.target.value })
              }
              placeholder="Contact name"
            />
          </Field>
          <Field label="Relationship" optional>
            <Select
              value={values.emergencyContactRelation}
              onValueChange={(value) =>
                value && onChange({ emergencyContactRelation: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {EMERGENCY_RELATIONS.map((relation) => (
                  <SelectItem key={relation} value={relation}>
                    {relation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Number" optional>
          <Input
            value={values.emergencyContactPhone}
            onChange={(e) =>
              onChange({ emergencyContactPhone: e.target.value })
            }
            placeholder="+63 912 345 6789"
          />
        </Field>
      </div>
    </div>
  )
}
