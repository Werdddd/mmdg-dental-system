import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SignaturePad } from '@/components/shared/signature-pad'
import { isMinor } from '@/components/patients/data'
import { Field, SectionLabel } from '@/components/patients/intake/form-controls'
import type { PatientIntakeFormValues } from '@/components/patients/intake/types'

function RequiredMark() {
  return <span className="text-destructive">*</span>
}

function InlineInput({
  value,
  onChange,
  placeholder,
  width = 'w-40',
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  width?: string
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`inline-flex h-7 ${width} px-2 py-0 text-sm`}
    />
  )
}

interface ConsentSectionProps {
  values: PatientIntakeFormValues
  onChange: (patch: Partial<PatientIntakeFormValues>) => void
}

export function ConsentSection({ values, onChange }: ConsentSectionProps) {
  const patientName =
    `${values.firstName} ${values.lastName}`.trim() || 'Patient'
  const minor = isMinor(values.birthday)

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-8">
        <p>
          I, the undersigned, a patient of{' '}
          <InlineInput
            value={values.consentClinicName}
            onChange={(v) => onChange({ consentClinicName: v })}
            placeholder="Clinic name"
          />
          <RequiredMark /> Dental Clinic, hereby authorize Dr.{' '}
          <InlineInput
            value={values.consentDentistName}
            onChange={(v) => onChange({ consentDentistName: v })}
            placeholder="Dentist name"
          />
          <RequiredMark /> to perform or participate in the following operations
          and procedures: <RequiredMark />
        </p>
        <Textarea
          value={values.consentProceduresDescription}
          onChange={(e) =>
            onChange({ consentProceduresDescription: e.target.value })
          }
          placeholder="Describe the operations and procedures…"
          className="my-2 min-h-[64px] bg-background text-sm leading-normal"
        />
        <p>
          Any tissues or parts surgically removed may be disposed by{' '}
          <InlineInput
            value={values.consentDisposalClinicName}
            onChange={(v) => onChange({ consentDisposalClinicName: v })}
            placeholder="Clinic name"
          />{' '}
          Dental Clinic in accordance with customary practice.
        </p>
        <p>
          I also consent to the administration of such anesthetics as are
          necessary.
        </p>
        <p>
          I hereby certify that I have read and fully understood the above
          authorizations for surgical treatment.
        </p>
      </div>

      <div>
        <SectionLabel>Patient</SectionLabel>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SignaturePad
            label="Patient Signature"
            required
            value={values.consentPatientSignature}
            onChange={(consentPatientSignature) =>
              onChange({
                consentPatientSignature,
                consentPostOpAckSignature: consentPatientSignature,
              })
            }
            nameOptions={[patientName]}
            className="sm:col-span-1"
          />
          <Field label="Printed Name" optional>
            <Input
              value={values.consentPatientPrintedName}
              onChange={(e) =>
                onChange({ consentPatientPrintedName: e.target.value })
              }
              placeholder={patientName}
            />
          </Field>
          <Field label="Date Signed">
            <Input
              type="date"
              value={values.consentPatientSignedDate}
              onChange={(e) =>
                onChange({ consentPatientSignedDate: e.target.value })
              }
            />
          </Field>
        </div>
      </div>

      <div>
        <SectionLabel>Witness</SectionLabel>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SignaturePad
            label="Witness Signature"
            value={values.consentWitnessSignature}
            onChange={(consentWitnessSignature) =>
              onChange({ consentWitnessSignature })
            }
            nameOptions={[values.consentWitnessPrintedName || 'Witness']}
          />
          <Field label="Printed Name" optional>
            <Input
              value={values.consentWitnessPrintedName}
              onChange={(e) =>
                onChange({ consentWitnessPrintedName: e.target.value })
              }
              placeholder="Witness name"
            />
          </Field>
          <Field label="Date" optional>
            <Input
              type="date"
              value={values.consentWitnessSignedDate}
              onChange={(e) =>
                onChange({ consentWitnessSignedDate: e.target.value })
              }
            />
          </Field>
        </div>
      </div>

      {minor && (
        <div>
          <SectionLabel>Guardian (patient is below legal age)</SectionLabel>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
            <div className="space-y-3">
              <SignaturePad
                label="Guardian Signature"
                required
                value={values.consentGuardianSignature}
                onChange={(consentGuardianSignature) =>
                  onChange({ consentGuardianSignature })
                }
                nameOptions={[values.consentGuardianPrintedName || 'Guardian']}
              />
              <Field label="Printed Name" optional>
                <Input
                  value={values.consentGuardianPrintedName}
                  onChange={(e) =>
                    onChange({ consentGuardianPrintedName: e.target.value })
                  }
                  placeholder="Guardian name"
                />
              </Field>
            </div>
            <Field label="Date">
              <Input
                type="date"
                value={values.consentGuardianSignedDate}
                onChange={(e) =>
                  onChange({ consentGuardianSignedDate: e.target.value })
                }
              />
            </Field>
          </div>
        </div>
      )}

      <div>
        <SectionLabel>Post-Operative Instructions</SectionLabel>
        <p className="mt-2 text-sm">
          I have read and understood post-op instructions given to me.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SignaturePad
            label="Patient Signature"
            value={values.consentPostOpAckSignature}
            onChange={(consentPostOpAckSignature) =>
              onChange({ consentPostOpAckSignature })
            }
            nameOptions={[patientName]}
          />
          <Field label="Printed Name" optional>
            <Input
              value={values.consentPostOpAckPrintedName}
              onChange={(e) =>
                onChange({ consentPostOpAckPrintedName: e.target.value })
              }
              placeholder={patientName}
            />
          </Field>
          <Field label="Date Signed" optional>
            <Input
              type="date"
              value={values.consentPostOpAckSignedDate}
              onChange={(e) =>
                onChange({ consentPostOpAckSignedDate: e.target.value })
              }
            />
          </Field>
        </div>
      </div>
    </div>
  )
}
