'use client'

import { useState } from 'react'
import { FileSignature } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SignaturePreview } from '@/components/shared/signature-preview'
import { InfoCard } from '@/components/patients/details/info-card'
import type { PatientConsentFormRow } from '@/lib/data/patient-consent-forms'

interface ConsentFormCardProps {
  consentForm: PatientConsentFormRow | null
  patientName: string
}

export function ConsentFormCard({
  consentForm,
  patientName,
}: ConsentFormCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <InfoCard
      title="Consent & Waiver"
      icon={FileSignature}
      action={
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          View Full Consent Form
        </Button>
      }
    >
      {!consentForm ? (
        <p className="text-sm text-muted-foreground">
          No consent form on file yet.
        </p>
      ) : (
        <SignaturePreview
          label="Patient Signature"
          signature={consentForm.patientSignature}
          printedName={consentForm.patientPrintedName || patientName}
          date={consentForm.patientSignedDate}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Consent & Waiver Form</DialogTitle>
            <DialogDescription>
              Signed authorization on file for {patientName}.
            </DialogDescription>
          </DialogHeader>

          {!consentForm ? (
            <p className="text-sm text-muted-foreground">
              No consent form on file yet.
            </p>
          ) : (
            <div className="space-y-5">
              <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-8">
                <p>
                  I, the undersigned, a patient of{' '}
                  <strong>{consentForm.clinicName || '____________'}</strong>{' '}
                  Dental Clinic, hereby authorize Dr.{' '}
                  <strong>{consentForm.dentistName || '____________'}</strong>{' '}
                  to perform or participate in the following operations or
                  procedures and such additonal operations or procedures as are
                  considered therapeutically necessary on the basis of findings
                  during the course of the said operation.
                </p>

                <p>
                  Any tissues or parts surgically removed may be disposed of by{' '}
                  <strong>
                    {consentForm.disposalClinicName || '____________'}
                  </strong>{' '}
                  Dental Clinic in accordance with customary practice.
                </p>
                <p>
                  I also consent to the administration of such anesthetics as
                  are necessary.
                </p>
                <p>
                  I hereby certify that I have read and fully understood the
                  above authorizations for surgical treatment. I also understand
                  the reason why surgery is considered necessary, its advantages
                  and possible complications, if any, as well as possible
                  alternative mode of treatment, which are explained to me. I
                  also certify that no guarantee or assurance has been made as
                  to the results may be obtained.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SignaturePreview
                  label="Patient"
                  signature={consentForm.patientSignature}
                  printedName={consentForm.patientPrintedName || patientName}
                  date={consentForm.patientSignedDate}
                />
                <SignaturePreview
                  label="Witness"
                  signature={consentForm.witnessSignature}
                  printedName={consentForm.witnessPrintedName}
                  date={consentForm.witnessSignedDate}
                />
                {(consentForm.guardianSignature ||
                  consentForm.guardianPrintedName) && (
                  <SignaturePreview
                    label="Guardian"
                    signature={consentForm.guardianSignature}
                    printedName={consentForm.guardianPrintedName}
                    date={consentForm.guardianSignedDate}
                  />
                )}
              </div>

              <div>
                <p className="mb-2 text-sm bold">
                  I have read and understood post-op instructions given to me.
                </p>
                <SignaturePreview
                  label="Patient Signature"
                  signature={consentForm.postOpAckSignature}
                  printedName={consentForm.postOpAckPrintedName || patientName}
                  date={consentForm.postOpAckSignedDate}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </InfoCard>
  )
}
