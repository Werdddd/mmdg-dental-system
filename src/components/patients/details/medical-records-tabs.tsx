import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DentalHistoryTable } from '@/components/patients/details/dental-history-table'
import { DentalChartPanel } from '@/components/patients/details/dental-chart-panel'
import { PatientPaymentHistoryTable } from '@/components/patients/details/patient-payment-history-table'
import type {
  DentalHistoryEntry,
  PatientPaymentEntry,
  ToothRecord,
} from '@/components/patients/details/data'

interface MedicalRecordsTabsProps {
  dentalHistory: DentalHistoryEntry[]
  dentalChart: ToothRecord[]
  paymentHistory: PatientPaymentEntry[]
}

export function MedicalRecordsTabs({
  dentalHistory,
  dentalChart,
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
          <DentalChartPanel records={dentalChart} />
        </TabsContent>
        <TabsContent value="payments">
          <PatientPaymentHistoryTable entries={paymentHistory} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
