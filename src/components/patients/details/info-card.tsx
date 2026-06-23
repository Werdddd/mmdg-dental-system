import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface InfoCardProps {
  title: string
  icon?: LucideIcon
  children: ReactNode
}

export function InfoCard({ title, icon: Icon, children }: InfoCardProps) {
  return (
    <div className="flex flex-col rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        {Icon && <Icon className="size-4 text-primary" />}
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

interface InfoRowProps {
  label: string
  value: ReactNode
}

export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

interface InfoBlockProps {
  label: string
  value: ReactNode
}

export function InfoBlock({ label, value }: InfoBlockProps) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  )
}
