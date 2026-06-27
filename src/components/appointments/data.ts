import { formatDisplayDate } from '@/lib/utils'

export type AppointmentStatus =
  | 'Confirmed'
  | 'Completed'
  | 'Ongoing'
  | 'Cancelled'
  | 'Rescheduled'

export interface AppointmentRow {
  id: string
  scheduledAt: string // ISO 8601
  date: string
  time: string
  patient: { id: string; name: string; initials: string; phone: string }
  dentist: { name: string; initials: string; specialty: string }
  notes: string // treatment done / treatment plan
  status: AppointmentStatus
}

export const APPOINTMENTS: AppointmentRow[] = [
  {
    id: 'apt-1',
    scheduledAt: '2026-06-21T09:00:00.000Z',
    date: 'Jun 21, 2026',
    time: '9:00 AM',
    patient: { id: 'mock-p-1', name: 'Maria Santos', initials: 'MS', phone: '+63 912 345 6781' },
    dentist: { name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'Routine prophylaxis and fluoride treatment.',
    status: 'Confirmed',
  },
  {
    id: 'apt-2',
    scheduledAt: '2026-06-21T10:30:00.000Z',
    date: 'Jun 21, 2026',
    time: '10:30 AM',
    patient: { id: 'mock-p-2', name: 'James Cruz', initials: 'JC', phone: '+63 917 222 4456' },
    dentist: { name: 'Dr. Michael Tan', initials: 'MT', specialty: 'Orthodontist' },
    notes: 'Braces adjustment – upper arch wire replacement.',
    status: 'Ongoing',
  },
  {
    id: 'apt-3',
    scheduledAt: '2026-06-21T13:15:00.000Z',
    date: 'Jun 21, 2026',
    time: '1:15 PM',
    patient: { id: 'mock-p-3', name: 'Liza Fernandez', initials: 'LF', phone: '+63 905 671 2390' },
    dentist: { name: 'Dr. Elena Cruz', initials: 'EC', specialty: 'Oral Surgeon' },
    notes: 'Extraction of lower left molar #36. Post-op instructions given.',
    status: 'Completed',
  },
  {
    id: 'apt-4',
    scheduledAt: '2026-06-22T11:00:00.000Z',
    date: 'Jun 22, 2026',
    time: '11:00 AM',
    patient: { id: 'mock-p-4', name: 'Noah Bautista', initials: 'NB', phone: '+63 918 044 7723' },
    dentist: { name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'Routine check-up and cleaning.',
    status: 'Cancelled',
  },
  {
    id: 'apt-5',
    scheduledAt: '2026-06-22T15:30:00.000Z',
    date: 'Jun 22, 2026',
    time: '3:30 PM',
    patient: { id: 'mock-p-5', name: 'Ana Lim', initials: 'AL', phone: '+63 933 110 8845' },
    dentist: { name: 'Dr. Joshua Santos', initials: 'JS', specialty: 'Pediatric Dentist' },
    notes: 'Sealant application on permanent molars.',
    status: 'Confirmed',
  },
  {
    id: 'apt-6',
    scheduledAt: '2026-06-23T09:30:00.000Z',
    date: 'Jun 23, 2026',
    time: '9:30 AM',
    patient: { id: 'mock-p-6', name: 'Mark Tan', initials: 'MT', phone: '+63 922 384 1190' },
    dentist: { name: 'Dr. Patricia Lim', initials: 'PL', specialty: 'Periodontist' },
    notes: 'Scaling and root planing – lower quadrant.',
    status: 'Rescheduled',
  },
  {
    id: 'apt-7',
    scheduledAt: '2026-06-23T14:00:00.000Z',
    date: 'Jun 23, 2026',
    time: '2:00 PM',
    patient: { id: 'mock-p-7', name: 'Carla Reyes', initials: 'CR', phone: '+63 906 552 9981' },
    dentist: { name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'Composite filling – upper right premolar #14.',
    status: 'Completed',
  },
  {
    id: 'apt-8',
    scheduledAt: '2026-06-24T10:00:00.000Z',
    date: 'Jun 24, 2026',
    time: '10:00 AM',
    patient: { id: 'mock-p-8', name: 'Paolo Mendoza', initials: 'PM', phone: '+63 919 773 2204' },
    dentist: { name: 'Dr. Michael Tan', initials: 'MT', specialty: 'Orthodontist' },
    notes: 'Initial consultation for orthodontic evaluation.',
    status: 'Confirmed',
  },
  {
    id: 'apt-9',
    scheduledAt: '2026-06-24T16:00:00.000Z',
    date: 'Jun 24, 2026',
    time: '4:00 PM',
    patient: { id: 'mock-p-9', name: 'Grace Villanueva', initials: 'GV', phone: '+63 947 661 3328' },
    dentist: { name: 'Dr. Elena Cruz', initials: 'EC', specialty: 'Oral Surgeon' },
    notes: 'Impacted wisdom tooth removal – upper right #18.',
    status: 'Ongoing',
  },
  {
    id: 'apt-10',
    scheduledAt: '2026-06-24T17:15:00.000Z',
    date: 'Jun 24, 2026',
    time: '5:15 PM',
    patient: { id: 'mock-p-10', name: 'Diego Ramos', initials: 'DR', phone: '+63 928 514 7762' },
    dentist: { name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'Teeth whitening – in-office bleaching session.',
    status: 'Confirmed',
  },
  {
    id: 'apt-11',
    scheduledAt: '2026-06-25T09:00:00.000Z',
    date: 'Jun 25, 2026',
    time: '9:00 AM',
    patient: { id: 'mock-p-11', name: 'Sofia Garcia', initials: 'SG', phone: '+63 915 330 6647' },
    dentist: { name: 'Dr. Joshua Santos', initials: 'JS', specialty: 'Pediatric Dentist' },
    notes: 'Pediatric check-up and fluoride varnish.',
    status: 'Confirmed',
  },
  {
    id: 'apt-12',
    scheduledAt: '2026-06-25T11:30:00.000Z',
    date: 'Jun 25, 2026',
    time: '11:30 AM',
    patient: { id: 'mock-p-12', name: 'Miguel Torres', initials: 'MT', phone: '+63 939 882 1056' },
    dentist: { name: 'Dr. Patricia Lim', initials: 'PL', specialty: 'Periodontist' },
    notes: 'Periodontal maintenance visit.',
    status: 'Cancelled',
  },
  {
    id: 'apt-13',
    scheduledAt: '2026-06-25T13:45:00.000Z',
    date: 'Jun 25, 2026',
    time: '1:45 PM',
    patient: { id: 'mock-p-13', name: 'Isabel Cruz', initials: 'IC', phone: '+63 917 446 9923' },
    dentist: { name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'Crown preparation – upper left #25.',
    status: 'Rescheduled',
  },
  {
    id: 'apt-14',
    scheduledAt: '2026-06-26T09:15:00.000Z',
    date: 'Jun 26, 2026',
    time: '9:15 AM',
    patient: { id: 'mock-p-14', name: 'Rafael Santos', initials: 'RS', phone: '+63 906 271 5510' },
    dentist: { name: 'Dr. Michael Tan', initials: 'MT', specialty: 'Orthodontist' },
    notes: 'Braces removal and retainer fitting.',
    status: 'Completed',
  },
  {
    id: 'apt-15',
    scheduledAt: '2026-06-26T10:45:00.000Z',
    date: 'Jun 26, 2026',
    time: '10:45 AM',
    patient: { id: 'mock-p-15', name: 'Camille Aquino', initials: 'CA', phone: '+63 922 905 3387' },
    dentist: { name: 'Dr. Elena Cruz', initials: 'EC', specialty: 'Oral Surgeon' },
    notes: 'Post-operative follow-up after extraction.',
    status: 'Confirmed',
  },
  {
    id: 'apt-16',
    scheduledAt: '2026-06-26T14:30:00.000Z',
    date: 'Jun 26, 2026',
    time: '2:30 PM',
    patient: { id: 'mock-p-16', name: 'Joshua Lim', initials: 'JL', phone: '+63 933 661 4471' },
    dentist: { name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'Root canal treatment – lower right molar #46.',
    status: 'Ongoing',
  },
  {
    id: 'apt-17',
    scheduledAt: '2026-06-27T09:00:00.000Z',
    date: 'Jun 27, 2026',
    time: '9:00 AM',
    patient: { id: 'mock-p-17', name: 'Patricia Gomez', initials: 'PG', phone: '+63 918 224 6650' },
    dentist: { name: 'Dr. Joshua Santos', initials: 'JS', specialty: 'Pediatric Dentist' },
    notes: 'Space maintainer placement – lower left.',
    status: 'Confirmed',
  },
  {
    id: 'apt-18',
    scheduledAt: '2026-06-27T11:15:00.000Z',
    date: 'Jun 27, 2026',
    time: '11:15 AM',
    patient: { id: 'mock-p-18', name: 'Andres Dela Cruz', initials: 'AD', phone: '+63 905 117 8834' },
    dentist: { name: 'Dr. Patricia Lim', initials: 'PL', specialty: 'Periodontist' },
    notes: 'Full-mouth debridement. Referred for perio surgery consult.',
    status: 'Completed',
  },
  {
    id: 'apt-19',
    scheduledAt: '2026-06-27T15:00:00.000Z',
    date: 'Jun 27, 2026',
    time: '3:00 PM',
    patient: { id: 'mock-p-19', name: 'Kristine Navarro', initials: 'KN', phone: '+63 947 338 2295' },
    dentist: { name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'Veneer consultation and shade matching.',
    status: 'Cancelled',
  },
  {
    id: 'apt-20',
    scheduledAt: '2026-06-28T09:30:00.000Z',
    date: 'Jun 28, 2026',
    time: '9:30 AM',
    patient: { id: 'mock-p-20', name: 'Leo Domingo', initials: 'LD', phone: '+63 928 660 1147' },
    dentist: { name: 'Dr. Michael Tan', initials: 'MT', specialty: 'Orthodontist' },
    notes: 'Mid-treatment progress evaluation.',
    status: 'Confirmed',
  },
  {
    id: 'apt-21',
    scheduledAt: '2026-06-28T13:00:00.000Z',
    date: 'Jun 28, 2026',
    time: '1:00 PM',
    patient: { id: 'mock-p-21', name: 'Angela Pascual', initials: 'AP', phone: '+63 915 778 3362' },
    dentist: { name: 'Dr. Elena Cruz', initials: 'EC', specialty: 'Oral Surgeon' },
    notes: 'Biopsy of soft tissue lesion – left buccal mucosa.',
    status: 'Rescheduled',
  },
  {
    id: 'apt-22',
    scheduledAt: '2026-06-28T16:30:00.000Z',
    date: 'Jun 28, 2026',
    time: '4:30 PM',
    patient: { id: 'mock-p-22', name: 'Vincent Ocampo', initials: 'VO', phone: '+63 939 224 6678' },
    dentist: { name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'Denture adjustment and relining.',
    status: 'Confirmed',
  },
  {
    id: 'apt-23',
    scheduledAt: '2026-06-29T10:00:00.000Z',
    date: 'Jun 29, 2026',
    time: '10:00 AM',
    patient: { id: 'mock-p-23', name: 'Trisha Ramirez', initials: 'TR', phone: '+63 917 552 9904' },
    dentist: { name: 'Dr. Joshua Santos', initials: 'JS', specialty: 'Pediatric Dentist' },
    notes: 'Pulpotomy – primary molar. Stainless steel crown placed.',
    status: 'Completed',
  },
  {
    id: 'apt-24',
    scheduledAt: '2026-06-29T14:15:00.000Z',
    date: 'Jun 29, 2026',
    time: '2:15 PM',
    patient: { id: 'mock-p-24', name: 'Nathaniel Cruz', initials: 'NC', phone: '+63 906 884 1123' },
    dentist: { name: 'Dr. Patricia Lim', initials: 'PL', specialty: 'Periodontist' },
    notes: 'Laser gingival contouring – anterior teeth.',
    status: 'Ongoing',
  },
  {
    id: 'apt-25',
    scheduledAt: '2026-06-29T16:45:00.000Z',
    date: 'Jun 29, 2026',
    time: '4:45 PM',
    patient: { id: 'mock-p-25', name: 'Bianca Reyes', initials: 'BR', phone: '+63 922 661 7745' },
    dentist: { name: 'Dr. Sarah Reyes', initials: 'SR', specialty: 'General Dentist' },
    notes: 'Composite bonding – lower front teeth.',
    status: 'Confirmed',
  },
]

export function computeAppointmentsSummary(appointments: AppointmentRow[]) {
  const now = new Date()
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const today = formatDisplayDate(todayIso)

  return {
    todayCount: appointments.filter((a) => a.date === today).length,
    upcomingCount: appointments.filter(
      (a) =>
        a.date !== today &&
        (a.status === 'Confirmed' || a.status === 'Rescheduled'),
    ).length,
    completedCount: appointments.filter((a) => a.status === 'Completed').length,
    cancelledCount: appointments.filter((a) => a.status === 'Cancelled').length,
  }
}
