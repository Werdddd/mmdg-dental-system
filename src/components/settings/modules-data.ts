import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Building2,
  CalendarClock,
  CalendarDays,
  MessageSquareText,
  Receipt,
  Users,
  Wallet,
} from 'lucide-react'

export interface ModuleItem {
  id: string
  name: string
  description: string
  icon: LucideIcon
  enabled: boolean
}

export const MODULES: ModuleItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard & Analytics',
    description: 'Overview stats, charts, and activity feed for staff.',
    icon: BarChart3,
    enabled: true,
  },
  {
    id: 'appointments',
    name: 'Appointments',
    description: 'Scheduling, calendar, and appointment statuses.',
    icon: CalendarDays,
    enabled: true,
  },
  {
    id: 'patients',
    name: 'Patients',
    description: 'Patient records, history, and contact details.',
    icon: Users,
    enabled: true,
  },
  {
    id: 'payments',
    name: 'Payments',
    description: 'Record and track patient payments and methods.',
    icon: Wallet,
    enabled: true,
  },
  {
    id: 'invoices',
    name: 'Invoices',
    description: 'Billing, due dates, and outstanding balances.',
    icon: Receipt,
    enabled: true,
  },
  {
    id: 'online-booking',
    name: 'Online Booking',
    description: 'Let patients request appointments from a public page.',
    icon: CalendarClock,
    enabled: false,
  },
  {
    id: 'notifications',
    name: 'SMS & Email Notifications',
    description: 'Automated reminders and confirmations for patients.',
    icon: MessageSquareText,
    enabled: false,
  },
  {
    id: 'multi-clinic',
    name: 'Multi-Clinic Support',
    description: 'Manage multiple clinic branches under one account.',
    icon: Building2,
    enabled: true,
  },
]

export interface ControlItem {
  id: string
  name: string
  description: string
  enabled: boolean
}

export const SYSTEM_CONTROLS: ControlItem[] = [
  {
    id: 'require-deposit',
    name: 'Require deposit for new appointments',
    description:
      'Patients must pay a partial deposit before a booking is confirmed.',
    enabled: false,
  },
  {
    id: 'auto-invoice',
    name: 'Auto-generate invoice on completed appointment',
    description:
      'Creates a draft invoice automatically once a visit is marked completed.',
    enabled: true,
  },
  {
    id: 'online-reschedule',
    name: 'Allow patients to reschedule online',
    description:
      'Patients can move their own appointment without staff approval.',
    enabled: false,
  },
  {
    id: 'two-factor',
    name: 'Require two-factor authentication for Admins',
    description:
      'Admins and SuperAdmins must verify with a second factor at login.',
    enabled: false,
  },
  {
    id: 'maintenance-mode',
    name: 'Maintenance mode',
    description: 'Temporarily block staff sign-in while you make changes.',
    enabled: false,
  },
]
