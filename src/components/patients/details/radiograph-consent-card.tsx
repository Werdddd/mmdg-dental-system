'use client'

import { useState } from 'react'
import { Radiation } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SignaturePreview } from '@/components/shared/signature-preview'
import { InfoCard } from '@/components/patients/details/info-card'
import { RadiographConsentDialog } from '@/components/appointments/radiograph-consent-dialog'
import type { PatientRadiographConsentRow } from '@/lib/data/patient-radiograph-consents'

interface RadiographConsentCardProps {
  patientId: string
  patientName: string
  patientAddress: string
  radiographConsent: PatientRadiographConsentRow | null
}

function selectedTypes(consent: PatientRadiographConsentRow | null) {
  if (!consent) return ''
  const types = [
    consent.cbct && 'CBCT',
    consent.panoramic && 'Panoramic',
    consent.pfm && 'PFM',
  ].filter(Boolean)
  return types.length ? types.join(', ') : 'None recorded'
}

export function RadiographConsentCard({
  patientId,
  patientName,
  patientAddress,
  radiographConsent,
}: RadiographConsentCardProps) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(radiographConsent)

  return (
    <InfoCard
      title="Radiograph Release"
      icon={Radiation}
      action={
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          {current ? 'View / Edit' : 'Sign Form'}
        </Button>
      }
    >
      {!current ? (
        <p className="text-sm text-muted-foreground">
          No radiograph release form on file yet.
        </p>
      ) : (
        <>
          <p className="mb-2 text-sm text-muted-foreground">
            Recommended: {selectedTypes(current)}
          </p>
          <SignaturePreview
            label="Patient Signature"
            signature={current.patientSignature}
            printedName={patientName}
            date={current.signedDate}
          />
        </>
      )}

      <RadiographConsentDialog
        open={open}
        onOpenChange={setOpen}
        patientId={patientId}
        patientName={patientName}
        patientAddress={patientAddress}
        initialValue={current}
        onSaved={setCurrent}
      />
    </InfoCard>
  )
}
