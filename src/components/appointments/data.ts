import type { VariantProps } from 'class-variance-authority'
import type { badgeVariants } from '@/components/ui/badge'
import { formatDisplayDate } from '@/lib/utils'

// ── Status type ───────────────────────────────────────────────────────────────

export type AppointmentStatus =
  | 'Scheduled'    // booked, not yet seen
  | 'In Progress'  // patient is in the chair
  | 'Completed'    // treatment done
  | 'Cancelled'    // cancelled by clinic or patient
  | 'No Show'      // patient did not arrive
  | 'Rescheduled'  // moved — a new Scheduled appointment will be created

// ── Badge colors ──────────────────────────────────────────────────────────────

export const STATUS_VARIANT: Record<
  AppointmentStatus,
  VariantProps<typeof badgeVariants>['variant']
> = {
  Scheduled:     'info',
  'In Progress': 'purple',
  Completed:     'success',
  Cancelled:     'destructive',
  'No Show':     'secondary',
  Rescheduled:   'outline',
}

// ── State machine ─────────────────────────────────────────────────────────────

export const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  Scheduled:     ['In Progress', 'No Show', 'Cancelled', 'Rescheduled'],
  'In Progress': ['Completed', 'Cancelled'],
  Completed:     [],
  Cancelled:     ['Rescheduled'],
  'No Show':     ['Rescheduled'],
  Rescheduled:   ['Cancelled'],
}

// A patient can only have one appointment in these states at a time.
export const ACTIVE_STATUSES: AppointmentStatus[] = ['In Progress']

// Statuses allowed when creating a brand-new appointment.
export const NEW_APPOINTMENT_STATUSES: AppointmentStatus[] = ['Scheduled']

// ── Notes label ───────────────────────────────────────────────────────────────

export function getNotesLabel(status: AppointmentStatus): string {
  switch (status) {
    case 'Completed':     return 'Procedure Done'
    case 'In Progress':   return 'Treatment in Progress'
    case 'Cancelled':     return 'Cancellation Notes'
    case 'No Show':       return 'Notes'
    case 'Rescheduled':   return 'Reschedule Reason'
    default:              return 'Treatment Plan'
  }
}

// ── Data shape ────────────────────────────────────────────────────────────────

export interface AppointmentRow {
  id: string
  scheduledAt: string
  date: string
  time: string
  patient: { id: string; name: string; initials: string; phone: string }
  dentist: { id: string; name: string; initials: string; specialty: string }
  notes: string
  status: AppointmentStatus
  // Optional: absent on the legacy mock data below, always present on
  // Supabase-backed rows (see getAllAppointments in lib/data/appointments).
  clinic?: { id: string; name: string }
}

// ── Mock data ─────────────────────────────────────────────────────────────────
// Current date: Jun 27, 2026
//   Past  (Jun 21–26) → terminal: Completed / Cancelled / No Show / Rescheduled
//   Today (Jun 27)    → active:   Completed / In Progress / Scheduled
//   Future (Jun 28+)  → Scheduled

export const APPOINTMENTS: AppointmentRow[] = [
  // ── Jun 21 ──────────────────────────────────────────────────────────
  {
    id: 'apt-1', scheduledAt: '2026-06-21T09:00:00.000Z',
    date: 'Jun 21, 2026', time: '9:00 AM',
    patient: { id: 'mock-p-1', name: 'Maria Santos', initials: 'MS', phone: '+63 912 345 6781' },
    dentist: { id: 'mock-d-sr', name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'Routine prophylaxis and fluoride treatment completed.',
    status: 'Completed',
  },
  {
    id: 'apt-2', scheduledAt: '2026-06-21T10:30:00.000Z',
    date: 'Jun 21, 2026', time: '10:30 AM',
    patient: { id: 'mock-p-2', name: 'James Cruz', initials: 'JC', phone: '+63 917 222 4456' },
    dentist: { id: 'mock-d-mt', name: 'Dr. Michael Tan', initials: 'MT', specialty: 'Orthodontist' },
    notes: 'Braces adjustment – upper arch wire replaced. Next visit in 4 weeks.',
    status: 'Completed',
  },
  {
    id: 'apt-3', scheduledAt: '2026-06-21T13:15:00.000Z',
    date: 'Jun 21, 2026', time: '1:15 PM',
    patient: { id: 'mock-p-3', name: 'Liza Fernandez', initials: 'LF', phone: '+63 905 671 2390' },
    dentist: { id: 'mock-d-ec', name: 'Dr. Elena Cruz', initials: 'EC', specialty: 'Oral Surgeon' },
    notes: 'Extraction of lower left molar #36. Post-op instructions given.',
    status: 'Completed',
  },
  // ── Jun 22 ──────────────────────────────────────────────────────────
  {
    id: 'apt-4', scheduledAt: '2026-06-22T11:00:00.000Z',
    date: 'Jun 22, 2026', time: '11:00 AM',
    patient: { id: 'mock-p-4', name: 'Noah Bautista', initials: 'NB', phone: '+63 918 044 7723' },
    dentist: { id: 'mock-d-sr', name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'Patient called to cancel – conflicting schedule.',
    status: 'Cancelled',
  },
  {
    id: 'apt-5', scheduledAt: '2026-06-22T15:30:00.000Z',
    date: 'Jun 22, 2026', time: '3:30 PM',
    patient: { id: 'mock-p-5', name: 'Ana Lim', initials: 'AL', phone: '+63 933 110 8845' },
    dentist: { id: 'mock-d-js', name: 'Dr. Joshua Santos', initials: 'JS', specialty: 'Pediatric Dentist' },
    notes: 'Sealant application on permanent molars – all four quadrants.',
    status: 'Completed',
  },
  // ── Jun 23 ──────────────────────────────────────────────────────────
  {
    id: 'apt-6', scheduledAt: '2026-06-23T09:30:00.000Z',
    date: 'Jun 23, 2026', time: '9:30 AM',
    patient: { id: 'mock-p-6', name: 'Mark Tan', initials: 'MT', phone: '+63 922 384 1190' },
    dentist: { id: 'mock-d-pl', name: 'Dr. Patricia Lim', initials: 'PL', specialty: 'Periodontist' },
    notes: 'Patient requested to move to next available slot.',
    status: 'Rescheduled',
  },
  {
    id: 'apt-7', scheduledAt: '2026-06-23T14:00:00.000Z',
    date: 'Jun 23, 2026', time: '2:00 PM',
    patient: { id: 'mock-p-7', name: 'Carla Reyes', initials: 'CR', phone: '+63 906 552 9981' },
    dentist: { id: 'mock-d-sr', name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'Composite filling – upper right premolar #14. Shade A2.',
    status: 'Completed',
  },
  // ── Jun 24 ──────────────────────────────────────────────────────────
  {
    id: 'apt-8', scheduledAt: '2026-06-24T10:00:00.000Z',
    date: 'Jun 24, 2026', time: '10:00 AM',
    patient: { id: 'mock-p-8', name: 'Paolo Mendoza', initials: 'PM', phone: '+63 919 773 2204' },
    dentist: { id: 'mock-d-mt', name: 'Dr. Michael Tan', initials: 'MT', specialty: 'Orthodontist' },
    notes: 'Initial ortho consultation. Recommended full fixed appliance. Photos and X-rays taken.',
    status: 'Completed',
  },
  {
    id: 'apt-9', scheduledAt: '2026-06-24T16:00:00.000Z',
    date: 'Jun 24, 2026', time: '4:00 PM',
    patient: { id: 'mock-p-9', name: 'Grace Villanueva', initials: 'GV', phone: '+63 947 661 3328' },
    dentist: { id: 'mock-d-ec', name: 'Dr. Elena Cruz', initials: 'EC', specialty: 'Oral Surgeon' },
    notes: 'Patient did not arrive. No prior notice given.',
    status: 'No Show',
  },
  {
    id: 'apt-10', scheduledAt: '2026-06-24T17:15:00.000Z',
    date: 'Jun 24, 2026', time: '5:15 PM',
    patient: { id: 'mock-p-10', name: 'Diego Ramos', initials: 'DR', phone: '+63 928 514 7762' },
    dentist: { id: 'mock-d-sr', name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'In-office Zoom whitening. 3 × 15 min sessions.',
    status: 'Completed',
  },
  // ── Jun 25 ──────────────────────────────────────────────────────────
  {
    id: 'apt-11', scheduledAt: '2026-06-25T09:00:00.000Z',
    date: 'Jun 25, 2026', time: '9:00 AM',
    patient: { id: 'mock-p-11', name: 'Sofia Garcia', initials: 'SG', phone: '+63 915 330 6647' },
    dentist: { id: 'mock-d-js', name: 'Dr. Joshua Santos', initials: 'JS', specialty: 'Pediatric Dentist' },
    notes: 'Pediatric check-up. Cleaning and fluoride varnish applied.',
    status: 'Completed',
  },
  {
    id: 'apt-12', scheduledAt: '2026-06-25T11:30:00.000Z',
    date: 'Jun 25, 2026', time: '11:30 AM',
    patient: { id: 'mock-p-12', name: 'Miguel Torres', initials: 'MT', phone: '+63 939 882 1056' },
    dentist: { id: 'mock-d-pl', name: 'Dr. Patricia Lim', initials: 'PL', specialty: 'Periodontist' },
    notes: 'Clinic operational issue; appointment cancelled by clinic.',
    status: 'Cancelled',
  },
  {
    id: 'apt-13', scheduledAt: '2026-06-25T13:45:00.000Z',
    date: 'Jun 25, 2026', time: '1:45 PM',
    patient: { id: 'mock-p-13', name: 'Isabel Cruz', initials: 'IC', phone: '+63 917 446 9923' },
    dentist: { id: 'mock-d-sr', name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'Patient did not arrive or contact the clinic.',
    status: 'No Show',
  },
  // ── Jun 26 ──────────────────────────────────────────────────────────
  {
    id: 'apt-14', scheduledAt: '2026-06-26T09:15:00.000Z',
    date: 'Jun 26, 2026', time: '9:15 AM',
    patient: { id: 'mock-p-14', name: 'Rafael Santos', initials: 'RS', phone: '+63 906 271 5510' },
    dentist: { id: 'mock-d-mt', name: 'Dr. Michael Tan', initials: 'MT', specialty: 'Orthodontist' },
    notes: 'Braces removal completed. Upper and lower Hawley retainers fitted.',
    status: 'Completed',
  },
  {
    id: 'apt-15', scheduledAt: '2026-06-26T10:45:00.000Z',
    date: 'Jun 26, 2026', time: '10:45 AM',
    patient: { id: 'mock-p-15', name: 'Camille Aquino', initials: 'CA', phone: '+63 922 905 3387' },
    dentist: { id: 'mock-d-ec', name: 'Dr. Elena Cruz', initials: 'EC', specialty: 'Oral Surgeon' },
    notes: 'Post-op follow-up after lower wisdom tooth extraction. Site healing well.',
    status: 'Completed',
  },
  {
    id: 'apt-16', scheduledAt: '2026-06-26T14:30:00.000Z',
    date: 'Jun 26, 2026', time: '2:30 PM',
    patient: { id: 'mock-p-16', name: 'Joshua Lim', initials: 'JL', phone: '+63 933 661 4471' },
    dentist: { id: 'mock-d-sr', name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'Root canal therapy – lower right molar #46. All canals instrumented and obturated.',
    status: 'Completed',
  },
  // ── Jun 27 (TODAY) ──────────────────────────────────────────────────
  {
    id: 'apt-17', scheduledAt: '2026-06-27T09:00:00.000Z',
    date: 'Jun 27, 2026', time: '9:00 AM',
    patient: { id: 'mock-p-17', name: 'Patricia Gomez', initials: 'PG', phone: '+63 918 224 6650' },
    dentist: { id: 'mock-d-js', name: 'Dr. Joshua Santos', initials: 'JS', specialty: 'Pediatric Dentist' },
    notes: 'Space maintainer placement – lower left primary molar. Procedure successful.',
    status: 'Completed',
  },
  {
    id: 'apt-18', scheduledAt: '2026-06-27T11:15:00.000Z',
    date: 'Jun 27, 2026', time: '11:15 AM',
    patient: { id: 'mock-p-18', name: 'Andres Dela Cruz', initials: 'AD', phone: '+63 905 117 8834' },
    dentist: { id: 'mock-d-pl', name: 'Dr. Patricia Lim', initials: 'PL', specialty: 'Periodontist' },
    notes: 'Full-mouth debridement in progress. Periodontal charting ongoing.',
    status: 'In Progress',
  },
  {
    id: 'apt-19', scheduledAt: '2026-06-27T13:00:00.000Z',
    date: 'Jun 27, 2026', time: '1:00 PM',
    patient: { id: 'mock-p-19', name: 'Kristine Navarro', initials: 'KN', phone: '+63 947 338 2295' },
    dentist: { id: 'mock-d-sr', name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'Veneer consultation and shade matching.',
    status: 'Scheduled',
  },
  {
    id: 'apt-19b', scheduledAt: '2026-06-27T15:00:00.000Z',
    date: 'Jun 27, 2026', time: '3:00 PM',
    patient: { id: 'mock-p-26', name: 'Marco Villanueva', initials: 'MV', phone: '+63 912 998 7743' },
    dentist: { id: 'mock-d-mt', name: 'Dr. Michael Tan', initials: 'MT', specialty: 'Orthodontist' },
    notes: 'Braces consultation for upper arch alignment.',
    status: 'Scheduled',
  },
  // ── Jun 28 (upcoming) ───────────────────────────────────────────────
  {
    id: 'apt-20', scheduledAt: '2026-06-28T09:30:00.000Z',
    date: 'Jun 28, 2026', time: '9:30 AM',
    patient: { id: 'mock-p-20', name: 'Leo Domingo', initials: 'LD', phone: '+63 928 660 1147' },
    dentist: { id: 'mock-d-mt', name: 'Dr. Michael Tan', initials: 'MT', specialty: 'Orthodontist' },
    notes: 'Mid-treatment progress evaluation. Check wire tension and bracket positioning.',
    status: 'Scheduled',
  },
  {
    id: 'apt-21', scheduledAt: '2026-06-28T13:00:00.000Z',
    date: 'Jun 28, 2026', time: '1:00 PM',
    patient: { id: 'mock-p-21', name: 'Angela Pascual', initials: 'AP', phone: '+63 915 778 3362' },
    dentist: { id: 'mock-d-ec', name: 'Dr. Elena Cruz', initials: 'EC', specialty: 'Oral Surgeon' },
    notes: 'Biopsy of soft tissue lesion – left buccal mucosa.',
    status: 'Scheduled',
  },
  {
    id: 'apt-22', scheduledAt: '2026-06-28T16:30:00.000Z',
    date: 'Jun 28, 2026', time: '4:30 PM',
    patient: { id: 'mock-p-22', name: 'Vincent Ocampo', initials: 'VO', phone: '+63 939 224 6678' },
    dentist: { id: 'mock-d-sr', name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'Denture adjustment and relining – upper partial denture.',
    status: 'Scheduled',
  },
  // ── Jun 29 (upcoming) ───────────────────────────────────────────────
  {
    id: 'apt-23', scheduledAt: '2026-06-29T10:00:00.000Z',
    date: 'Jun 29, 2026', time: '10:00 AM',
    patient: { id: 'mock-p-23', name: 'Trisha Ramirez', initials: 'TR', phone: '+63 917 552 9904' },
    dentist: { id: 'mock-d-js', name: 'Dr. Joshua Santos', initials: 'JS', specialty: 'Pediatric Dentist' },
    notes: 'Pulpotomy – evaluate primary molar #74.',
    status: 'Scheduled',
  },
  {
    id: 'apt-24', scheduledAt: '2026-06-29T14:15:00.000Z',
    date: 'Jun 29, 2026', time: '2:15 PM',
    patient: { id: 'mock-p-24', name: 'Nathaniel Cruz', initials: 'NC', phone: '+63 906 884 1123' },
    dentist: { id: 'mock-d-pl', name: 'Dr. Patricia Lim', initials: 'PL', specialty: 'Periodontist' },
    notes: 'Laser gingival contouring – aesthetic recontouring of anterior gingival margin.',
    status: 'Scheduled',
  },
  {
    id: 'apt-25', scheduledAt: '2026-06-29T16:45:00.000Z',
    date: 'Jun 29, 2026', time: '4:45 PM',
    patient: { id: 'mock-p-25', name: 'Bianca Reyes', initials: 'BR', phone: '+63 922 661 7745' },
    dentist: { id: 'mock-d-sr', name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'Composite bonding – lower anterior teeth for shape correction.',
    status: 'Scheduled',
  },
]

// ── Summary helper ────────────────────────────────────────────────────────────

export function computeAppointmentsSummary(appointments: AppointmentRow[]) {
  const now = new Date()
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const today = formatDisplayDate(todayIso)

  return {
    todayCount: appointments.filter((a) => a.date === today).length,
    upcomingCount: appointments.filter(
      (a) => a.date !== today && (a.status === 'Scheduled' || a.status === 'Rescheduled'),
    ).length,
    completedCount: appointments.filter((a) => a.status === 'Completed').length,
    cancelledCount: appointments.filter(
      (a) => a.status === 'Cancelled' || a.status === 'No Show',
    ).length,
  }
}
