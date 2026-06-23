import { formatDisplayDate } from '@/lib/utils'

export type AppointmentStatus =
  | 'Confirmed'
  | 'Completed'
  | 'Ongoing'
  | 'Cancelled'
  | 'Rescheduled'

export type AppointmentMode = 'In-person' | 'Video Call' | 'Phone Call'

export interface AppointmentRow {
  id: string
  date: string
  time: string
  patient: { name: string; initials: string; phone: string }
  dentist: { name: string; initials: string; specialty: string }
  mode: AppointmentMode
  status: AppointmentStatus
}

export const APPOINTMENTS: AppointmentRow[] = [
  {
    id: 'apt-1',
    date: 'Jun 21, 2026',
    time: '9:00 AM',
    patient: {
      name: 'Maria Santos',
      initials: 'MS',
      phone: '+63 912 345 6781',
    },
    dentist: {
      name: 'Dr. Sarah Reyes',
      initials: 'SR',
      specialty: 'General Dentist',
    },
    mode: 'In-person',
    status: 'Confirmed',
  },
  {
    id: 'apt-2',
    date: 'Jun 21, 2026',
    time: '10:30 AM',
    patient: { name: 'James Cruz', initials: 'JC', phone: '+63 917 222 4456' },
    dentist: {
      name: 'Dr. Michael Tan',
      initials: 'MT',
      specialty: 'Orthodontist',
    },
    mode: 'In-person',
    status: 'Ongoing',
  },
  {
    id: 'apt-3',
    date: 'Jun 21, 2026',
    time: '1:15 PM',
    patient: {
      name: 'Liza Fernandez',
      initials: 'LF',
      phone: '+63 905 671 2390',
    },
    dentist: {
      name: 'Dr. Elena Cruz',
      initials: 'EC',
      specialty: 'Oral Surgeon',
    },
    mode: 'In-person',
    status: 'Completed',
  },
  {
    id: 'apt-4',
    date: 'Jun 22, 2026',
    time: '11:00 AM',
    patient: {
      name: 'Noah Bautista',
      initials: 'NB',
      phone: '+63 918 044 7723',
    },
    dentist: {
      name: 'Dr. Sarah Reyes',
      initials: 'SR',
      specialty: 'General Dentist',
    },
    mode: 'Video Call',
    status: 'Cancelled',
  },
  {
    id: 'apt-5',
    date: 'Jun 22, 2026',
    time: '3:30 PM',
    patient: { name: 'Ana Lim', initials: 'AL', phone: '+63 933 110 8845' },
    dentist: {
      name: 'Dr. Joshua Santos',
      initials: 'JS',
      specialty: 'Pediatric Dentist',
    },
    mode: 'In-person',
    status: 'Confirmed',
  },
  {
    id: 'apt-6',
    date: 'Jun 23, 2026',
    time: '9:30 AM',
    patient: { name: 'Mark Tan', initials: 'MT', phone: '+63 922 384 1190' },
    dentist: {
      name: 'Dr. Patricia Lim',
      initials: 'PL',
      specialty: 'Periodontist',
    },
    mode: 'Phone Call',
    status: 'Rescheduled',
  },
  {
    id: 'apt-7',
    date: 'Jun 23, 2026',
    time: '2:00 PM',
    patient: { name: 'Carla Reyes', initials: 'CR', phone: '+63 906 552 9981' },
    dentist: {
      name: 'Dr. Sarah Reyes',
      initials: 'SR',
      specialty: 'General Dentist',
    },
    mode: 'In-person',
    status: 'Completed',
  },
  {
    id: 'apt-8',
    date: 'Jun 24, 2026',
    time: '10:00 AM',
    patient: {
      name: 'Paolo Mendoza',
      initials: 'PM',
      phone: '+63 919 773 2204',
    },
    dentist: {
      name: 'Dr. Michael Tan',
      initials: 'MT',
      specialty: 'Orthodontist',
    },
    mode: 'In-person',
    status: 'Confirmed',
  },
  {
    id: 'apt-9',
    date: 'Jun 24, 2026',
    time: '4:00 PM',
    patient: {
      name: 'Grace Villanueva',
      initials: 'GV',
      phone: '+63 947 661 3328',
    },
    dentist: {
      name: 'Dr. Elena Cruz',
      initials: 'EC',
      specialty: 'Oral Surgeon',
    },
    mode: 'Video Call',
    status: 'Ongoing',
  },
  {
    id: 'apt-10',
    date: 'Jun 24, 2026',
    time: '5:15 PM',
    patient: { name: 'Diego Ramos', initials: 'DR', phone: '+63 928 514 7762' },
    dentist: {
      name: 'Dr. Sarah Reyes',
      initials: 'SR',
      specialty: 'General Dentist',
    },
    mode: 'In-person',
    status: 'Confirmed',
  },
  {
    id: 'apt-11',
    date: 'Jun 25, 2026',
    time: '9:00 AM',
    patient: {
      name: 'Sofia Garcia',
      initials: 'SG',
      phone: '+63 915 330 6647',
    },
    dentist: {
      name: 'Dr. Joshua Santos',
      initials: 'JS',
      specialty: 'Pediatric Dentist',
    },
    mode: 'In-person',
    status: 'Confirmed',
  },
  {
    id: 'apt-12',
    date: 'Jun 25, 2026',
    time: '11:30 AM',
    patient: {
      name: 'Miguel Torres',
      initials: 'MT',
      phone: '+63 939 882 1056',
    },
    dentist: {
      name: 'Dr. Patricia Lim',
      initials: 'PL',
      specialty: 'Periodontist',
    },
    mode: 'In-person',
    status: 'Cancelled',
  },
  {
    id: 'apt-13',
    date: 'Jun 25, 2026',
    time: '1:45 PM',
    patient: { name: 'Isabel Cruz', initials: 'IC', phone: '+63 917 446 9923' },
    dentist: {
      name: 'Dr. Sarah Reyes',
      initials: 'SR',
      specialty: 'General Dentist',
    },
    mode: 'Phone Call',
    status: 'Rescheduled',
  },
  {
    id: 'apt-14',
    date: 'Jun 26, 2026',
    time: '9:15 AM',
    patient: {
      name: 'Rafael Santos',
      initials: 'RS',
      phone: '+63 906 271 5510',
    },
    dentist: {
      name: 'Dr. Michael Tan',
      initials: 'MT',
      specialty: 'Orthodontist',
    },
    mode: 'In-person',
    status: 'Completed',
  },
  {
    id: 'apt-15',
    date: 'Jun 26, 2026',
    time: '10:45 AM',
    patient: {
      name: 'Camille Aquino',
      initials: 'CA',
      phone: '+63 922 905 3387',
    },
    dentist: {
      name: 'Dr. Elena Cruz',
      initials: 'EC',
      specialty: 'Oral Surgeon',
    },
    mode: 'In-person',
    status: 'Confirmed',
  },
  {
    id: 'apt-16',
    date: 'Jun 26, 2026',
    time: '2:30 PM',
    patient: { name: 'Joshua Lim', initials: 'JL', phone: '+63 933 661 4471' },
    dentist: {
      name: 'Dr. Sarah Reyes',
      initials: 'SR',
      specialty: 'General Dentist',
    },
    mode: 'Video Call',
    status: 'Ongoing',
  },
  {
    id: 'apt-17',
    date: 'Jun 27, 2026',
    time: '9:00 AM',
    patient: {
      name: 'Patricia Gomez',
      initials: 'PG',
      phone: '+63 918 224 6650',
    },
    dentist: {
      name: 'Dr. Joshua Santos',
      initials: 'JS',
      specialty: 'Pediatric Dentist',
    },
    mode: 'In-person',
    status: 'Confirmed',
  },
  {
    id: 'apt-18',
    date: 'Jun 27, 2026',
    time: '11:15 AM',
    patient: {
      name: 'Andres Dela Cruz',
      initials: 'AD',
      phone: '+63 905 117 8834',
    },
    dentist: {
      name: 'Dr. Patricia Lim',
      initials: 'PL',
      specialty: 'Periodontist',
    },
    mode: 'In-person',
    status: 'Completed',
  },
  {
    id: 'apt-19',
    date: 'Jun 27, 2026',
    time: '3:00 PM',
    patient: {
      name: 'Kristine Navarro',
      initials: 'KN',
      phone: '+63 947 338 2295',
    },
    dentist: {
      name: 'Dr. Sarah Reyes',
      initials: 'SR',
      specialty: 'General Dentist',
    },
    mode: 'In-person',
    status: 'Cancelled',
  },
  {
    id: 'apt-20',
    date: 'Jun 28, 2026',
    time: '9:30 AM',
    patient: { name: 'Leo Domingo', initials: 'LD', phone: '+63 928 660 1147' },
    dentist: {
      name: 'Dr. Michael Tan',
      initials: 'MT',
      specialty: 'Orthodontist',
    },
    mode: 'In-person',
    status: 'Confirmed',
  },
  {
    id: 'apt-21',
    date: 'Jun 28, 2026',
    time: '1:00 PM',
    patient: {
      name: 'Angela Pascual',
      initials: 'AP',
      phone: '+63 915 778 3362',
    },
    dentist: {
      name: 'Dr. Elena Cruz',
      initials: 'EC',
      specialty: 'Oral Surgeon',
    },
    mode: 'Phone Call',
    status: 'Rescheduled',
  },
  {
    id: 'apt-22',
    date: 'Jun 28, 2026',
    time: '4:30 PM',
    patient: {
      name: 'Vincent Ocampo',
      initials: 'VO',
      phone: '+63 939 224 6678',
    },
    dentist: {
      name: 'Dr. Sarah Reyes',
      initials: 'SR',
      specialty: 'General Dentist',
    },
    mode: 'In-person',
    status: 'Confirmed',
  },
  {
    id: 'apt-23',
    date: 'Jun 29, 2026',
    time: '10:00 AM',
    patient: {
      name: 'Trisha Ramirez',
      initials: 'TR',
      phone: '+63 917 552 9904',
    },
    dentist: {
      name: 'Dr. Joshua Santos',
      initials: 'JS',
      specialty: 'Pediatric Dentist',
    },
    mode: 'In-person',
    status: 'Completed',
  },
  {
    id: 'apt-24',
    date: 'Jun 29, 2026',
    time: '2:15 PM',
    patient: {
      name: 'Nathaniel Cruz',
      initials: 'NC',
      phone: '+63 906 884 1123',
    },
    dentist: {
      name: 'Dr. Patricia Lim',
      initials: 'PL',
      specialty: 'Periodontist',
    },
    mode: 'In-person',
    status: 'Ongoing',
  },
  {
    id: 'apt-25',
    date: 'Jun 29, 2026',
    time: '4:45 PM',
    patient: {
      name: 'Bianca Reyes',
      initials: 'BR',
      phone: '+63 922 661 7745',
    },
    dentist: {
      name: 'Dr. Sarah Reyes',
      initials: 'SR',
      specialty: 'General Dentist',
    },
    mode: 'Video Call',
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
