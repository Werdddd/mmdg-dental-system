import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DentalHistoryTable } from '@/components/patients/details/dental-history-table'
import { DentalChartPanel } from '@/components/patients/details/dental-chart-panel'
import { PatientPaymentHistoryTable } from '@/components/patients/details/patient-payment-history-table'
import type {
  DentalHistoryEntry,
  PatientPaymentEntry,
} from '@/components/patients/details/data'
import type { ToothRecord } from '@/lib/data/dental-chart'
import type { ToothPhoto } from '@/lib/data/dental-chart-photos'
import type { ClinicBranch } from '@/lib/dental/branches'
import type { DentistOption } from '@/lib/data/dentists'

interface MedicalRecordsTabsProps {
  patientId: string
  dentalHistory: DentalHistoryEntry[]
  dentalChart: ToothRecord[]
  branches: ClinicBranch[]
  photos: ToothPhoto[]
  dentists: DentistOption[]
  paymentHistory: PatientPaymentEntry[]
}

export function MedicalRecordsTabs({
  patientId,
  dentalHistory,
  dentalChart,
  branches,
  photos,
  dentists,
  paymentHistory,
}: MedicalRecordsTabsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Medical Records
        </h2>
        <p className="text-sm text-muted-foreground">
          Dental history, tooth chart, and payment records for this patient.
        </p>
      </div>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Dental History</TabsTrigger>
          <TabsTrigger value="chart">Dental Chart Recording</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <DentalHistoryTable entries={dentalHistory} />
        </TabsContent>
        <TabsContent value="chart">
          <DentalChartPanel
            patientId={patientId}
            records={dentalChart}
            branches={branches}
            photos={photos}
            dentists={dentists}
          />
        </TabsContent>
        <TabsContent value="payments">
          <PatientPaymentHistoryTable entries={paymentHistory} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
