'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TreatmentRecordsTable } from '@/components/patients/details/treatment-records-table'
import { DentalChartPanel } from '@/components/patients/details/dental-chart-panel'
import { PatientPaymentHistoryTable } from '@/components/patients/details/patient-payment-history-table'
import { LogTreatmentDialog } from '@/components/patients/details/log-treatment-dialog'
import type { TreatmentRecordRow } from '@/lib/data/treatment-records'
import type { ToothRecord } from '@/lib/data/dental-chart'
import type { ToothPhoto } from '@/lib/data/dental-chart-photos'
import type { ClinicBranch } from '@/lib/dental/branches'
import type { DentistOption } from '@/lib/data/dentists'
import type { PaymentRow } from '@/components/payments/data'

interface MedicalRecordsTabsProps {
  patientId: string
  treatmentRecords: TreatmentRecordRow[]
  dentalChart: ToothRecord[]
  branches: ClinicBranch[]
  photos: ToothPhoto[]
  dentists: DentistOption[]
  payments: PaymentRow[]
  readOnlyChart?: boolean
}

export function MedicalRecordsTabs({
  patientId,
  treatmentRecords,
  dentalChart,
  branches,
  photos,
  dentists,
  payments,
  readOnlyChart = false,
}: MedicalRecordsTabsProps) {
  const [logTreatmentOpen, setLogTreatmentOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Medical Records
          </h2>
          <p className="text-sm text-muted-foreground">
            Treatment records, tooth chart, and payment history for this
            patient.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => setLogTreatmentOpen(true)}
        >
          <Plus className="size-4" />
          Log Treatment
        </Button>
      </div>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Treatment Records</TabsTrigger>
          <TabsTrigger value="chart">Dental Chart Recording</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <TreatmentRecordsTable entries={treatmentRecords} />
        </TabsContent>
        <TabsContent value="chart">
          <DentalChartPanel
            patientId={patientId}
            records={dentalChart}
            branches={branches}
            photos={photos}
            dentists={dentists}
            readOnly={readOnlyChart}
          />
        </TabsContent>
        <TabsContent value="payments">
          <PatientPaymentHistoryTable entries={payments} />
        </TabsContent>
      </Tabs>

      <LogTreatmentDialog
        patientId={patientId}
        dentists={dentists}
        open={logTreatmentOpen}
        onOpenChange={setLogTreatmentOpen}
      />
    </div>
  )
}
