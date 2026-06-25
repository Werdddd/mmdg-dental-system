import type { LucideIcon } from 'lucide-react'
import { CalendarPlus, Receipt, UserPlus, Wallet } from 'lucide-react'

interface QuickAction {
  icon: LucideIcon
  label: string
  key: string
}

const ACTIONS: QuickAction[] = [
  { key: 'appointment', icon: CalendarPlus, label: 'New Appointment' },
  { key: 'patient', icon: UserPlus, label: 'Add Patient' },
  { key: 'invoice', icon: Receipt, label: 'New Invoice' },
  { key: 'payment', icon: Wallet, label: 'New Payment' },
]

interface QuickActionsCardProps {
  onNewAppointment: () => void
  onAddPatient: () => void
  onNewInvoice: () => void
  onNewPayment: () => void
}

export function QuickActionsCard({
  onNewAppointment,
  onAddPatient,
  onNewInvoice,
  onNewPayment,
}: QuickActionsCardProps) {
  const handlers: Record<string, () => void> = {
    appointment: onNewAppointment,
    patient: onAddPatient,
    invoice: onNewInvoice,
    payment: onNewPayment,
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold">Quick Actions</h2>
      <p className="text-sm text-muted-foreground">Common daily tasks</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {ACTIONS.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            type="button"
            onClick={handlers[key]}
            className="flex flex-col items-center gap-2 rounded-lg border bg-background p-4 text-center transition-colors hover:bg-muted"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
