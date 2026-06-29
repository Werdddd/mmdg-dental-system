import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { PatientRow, PatientType } from '@/components/patients/data'
import type { NewPatientInput, UpdatePatientInput } from '@/lib/data/patients'
import type { SponsorRow, SetPatientSponsorshipInput } from '@/lib/data/sponsors'

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
const PATIENT_TYPES: PatientType[] = ['Regular', 'Sponsored', 'Pro Bono']

export interface PatientFormValues {
  fullName: string
  phone: string
  gender: PatientRow['gender']
  birthday: string
  address: string
  email: string
  nationality: string
  civilStatus: string
  emergencyContactName: string
  emergencyContactRelation: string
  emergencyContactPhone: string
  chiefComplaint: string
  symptoms: string
  affectedArea: string
  complaintRemarks: string
  patientType: PatientType
  sponsorId: string
  coveragePercentage: string
}

export const EMPTY_PATIENT_FORM_VALUES: PatientFormValues = {
  fullName: '',
  phone: '',
  gender: 'Female',
  birthday: '',
  address: '',
  email: '',
  nationality: '',
  civilStatus: '',
  emergencyContactName: '',
  emergencyContactRelation: '',
  emergencyContactPhone: '',
  chiefComplaint: '',
  symptoms: '',
  affectedArea: '',
  complaintRemarks: '',
  patientType: 'Regular',
  sponsorId: '',
  coveragePercentage: '',
}

export function patientToFormValues(patient: PatientRow): PatientFormValues {
  return {
    fullName: patient.name,
    phone: patient.phone,
    gender: patient.gender,
    birthday: patient.birthdayIso,
    address: patient.address,
    email: patient.email,
    nationality: patient.nationality,
    civilStatus: patient.civilStatus,
    emergencyContactName: patient.emergencyContact.name,
    emergencyContactRelation: patient.emergencyContact.relation,
    emergencyContactPhone: patient.emergencyContact.phone,
    chiefComplaint: patient.chiefComplaint.primaryComplaint,
    symptoms: patient.chiefComplaint.symptoms,
    affectedArea: patient.chiefComplaint.affectedArea,
    complaintRemarks: patient.chiefComplaint.remarks,
    patientType: patient.patientType,
    sponsorId: patient.sponsorship?.sponsorId ?? '',
    coveragePercentage: patient.sponsorship
      ? String(patient.sponsorship.coveragePercentage)
      : '',
  }
}

export function formValuesToInput(
  values: PatientFormValues,
): NewPatientInput & UpdatePatientInput {
  return {
    fullName: values.fullName.trim(),
    phone: values.phone.trim(),
    gender: values.gender,
    birthday: values.birthday,
    address: values.address.trim(),
    email: values.email.trim(),
    nationality: values.nationality.trim(),
    civilStatus: values.civilStatus,
    emergencyContactName: values.emergencyContactName.trim(),
    emergencyContactRelation: values.emergencyContactRelation,
    emergencyContactPhone: values.emergencyContactPhone.trim(),
    chiefComplaint: values.chiefComplaint.trim(),
    symptoms: values.symptoms.trim(),
    affectedArea: values.affectedArea.trim(),
    complaintRemarks: values.complaintRemarks.trim(),
    patientType: values.patientType,
  }
}

export function formValuesToSponsorship(
  values: PatientFormValues,
): SetPatientSponsorshipInput | undefined {
  if (values.patientType !== 'Sponsored' || !values.sponsorId) return undefined
  return {
    sponsorId: values.sponsorId,
    coveragePercentage: values.coveragePercentage.trim()
      ? Number(values.coveragePercentage)
      : 100,
  }
}

interface PatientFormFieldsProps {
  values: PatientFormValues
  onChange: (patch: Partial<PatientFormValues>) => void
  sponsors: SponsorRow[]
}

function Field({
  label,
  optional,
  children,
}: {
  label: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {label}{' '}
        {optional && (
          <span className="font-normal text-muted-foreground">(optional)</span>
        )}
      </label>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </p>
  )
}

export function PatientFormFields({
  values,
  onChange,
  sponsors,
}: PatientFormFieldsProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <SectionLabel>Billing</SectionLabel>
        <Field label="Patient Type">
          <Select
            value={values.patientType}
            onValueChange={(value) =>
              value && onChange({ patientType: value as PatientType })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PATIENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {values.patientType === 'Sponsored' && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sponsor">
              {sponsors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No sponsors yet — add one from the Sponsors page.
                </p>
              ) : (
                <Select
                  value={values.sponsorId || undefined}
                  onValueChange={(value) => {
                    if (!value) return
                    const sponsor = sponsors.find((s) => s.id === value)
                    onChange({
                      sponsorId: value,
                      coveragePercentage:
                        values.coveragePercentage ||
                        String(sponsor?.defaultCoveragePercentage ?? 100),
                    })
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {sponsors.map((sponsor) => (
                      <SelectItem key={sponsor.id} value={sponsor.id}>
                        {sponsor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>
            <Field label="Coverage %">
              <Input
                type="number"
                min={0}
                max={100}
                value={values.coveragePercentage}
                onChange={(e) =>
                  onChange({ coveragePercentage: e.target.value })
                }
                placeholder="100"
              />
            </Field>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Field label="Full Name">
          <Input
            value={values.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="Juan Dela Cruz"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Contact Number">
            <Input
              value={values.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+63 912 345 6789"
            />
          </Field>
          <Field label="Gender">
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
          <Field label="Birthday">
            <Input
              type="date"
              value={values.birthday}
              onChange={(e) => onChange({ birthday: e.target.value })}
            />
          </Field>
          <Field label="Civil Status" optional>
            <Select
              value={values.civilStatus || undefined}
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
        </div>

        <Field label="Address">
          <Input
            value={values.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="Quezon City, Metro Manila"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Email" optional>
            <Input
              type="email"
              value={values.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="juan@example.com"
            />
          </Field>
          <Field label="Nationality" optional>
            <Input
              value={values.nationality}
              onChange={(e) => onChange({ nationality: e.target.value })}
              placeholder="Filipino"
            />
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
          <Field label="Relation" optional>
            <Select
              value={values.emergencyContactRelation || undefined}
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
        <Field label="Phone" optional>
          <Input
            value={values.emergencyContactPhone}
            onChange={(e) =>
              onChange({ emergencyContactPhone: e.target.value })
            }
            placeholder="+63 912 345 6789"
          />
        </Field>
      </div>

      <div className="space-y-4">
        <SectionLabel>Chief Complaint</SectionLabel>
        <Field label="Primary Complaint" optional>
          <Input
            value={values.chiefComplaint}
            onChange={(e) => onChange({ chiefComplaint: e.target.value })}
            placeholder="Reason for visit"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Symptoms" optional>
            <Input
              value={values.symptoms}
              onChange={(e) => onChange({ symptoms: e.target.value })}
              placeholder="e.g. Sensitivity to cold"
            />
          </Field>
          <Field label="Affected Tooth / Area" optional>
            <Input
              value={values.affectedArea}
              onChange={(e) => onChange({ affectedArea: e.target.value })}
              placeholder="e.g. Tooth #19"
            />
          </Field>
        </div>
        <Field label="Additional Remarks" optional>
          <Textarea
            value={values.complaintRemarks}
            onChange={(e) => onChange({ complaintRemarks: e.target.value })}
            placeholder="Any other observations…"
            className="min-h-[64px] text-sm"
          />
        </Field>
      </div>
    </div>
  )
}
