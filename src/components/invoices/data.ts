export type InvoiceStatus = 'Paid' | 'Partially Paid' | 'Overdue' | 'Unpaid'

export interface InvoiceRow {
  id: string
  patient: { name: string; initials: string; phone: string }
  treatment: string
  createdDate: string
  dueDate: string
  subtotal: number
  tax: number
  total: number
  balance: number
  status: InvoiceStatus
}

interface InvoiceSeed {
  id: string
  patient: { name: string; initials: string; phone: string }
  treatment: string
  createdDate: string
  dueDate: string
  subtotal: number
  status: InvoiceStatus
  paidRatio: number
}

const TAX_RATE = 0.12

const SEED: InvoiceSeed[] = [
  {
    id: 'INV-2031',
    patient: {
      name: 'Maria Santos',
      initials: 'MS',
      phone: '+63 912 345 6781',
    },
    treatment: 'Dental Cleaning',
    createdDate: 'Jun 21, 2026',
    dueDate: 'Jul 5, 2026',
    subtotal: 1500,
    status: 'Paid',
    paidRatio: 1,
  },
  {
    id: 'INV-2032',
    patient: { name: 'James Cruz', initials: 'JC', phone: '+63 917 222 4456' },
    treatment: 'Root Canal Treatment',
    createdDate: 'Jun 21, 2026',
    dueDate: 'Jul 5, 2026',
    subtotal: 8500,
    status: 'Partially Paid',
    paidRatio: 0.5,
  },
  {
    id: 'INV-2033',
    patient: {
      name: 'Liza Fernandez',
      initials: 'LF',
      phone: '+63 905 671 2390',
    },
    treatment: 'Tooth Extraction',
    createdDate: 'Jun 20, 2026',
    dueDate: 'Jul 4, 2026',
    subtotal: 3200,
    status: 'Paid',
    paidRatio: 1,
  },
  {
    id: 'INV-2034',
    patient: {
      name: 'Noah Bautista',
      initials: 'NB',
      phone: '+63 918 044 7723',
    },
    treatment: 'Dental Filling',
    createdDate: 'Jun 5, 2026',
    dueDate: 'Jun 19, 2026',
    subtotal: 2200,
    status: 'Overdue',
    paidRatio: 0,
  },
  {
    id: 'INV-2035',
    patient: { name: 'Ana Lim', initials: 'AL', phone: '+63 933 110 8845' },
    treatment: 'Teeth Whitening',
    createdDate: 'Jun 19, 2026',
    dueDate: 'Jul 3, 2026',
    subtotal: 6500,
    status: 'Paid',
    paidRatio: 1,
  },
  {
    id: 'INV-2036',
    patient: { name: 'Mark Tan', initials: 'MT', phone: '+63 922 384 1190' },
    treatment: 'Braces Adjustment',
    createdDate: 'Jun 19, 2026',
    dueDate: 'Jul 3, 2026',
    subtotal: 1800,
    status: 'Paid',
    paidRatio: 1,
  },
  {
    id: 'INV-2037',
    patient: { name: 'Carla Reyes', initials: 'CR', phone: '+63 906 552 9981' },
    treatment: 'Dental Implant',
    createdDate: 'Jun 18, 2026',
    dueDate: 'Jul 2, 2026',
    subtotal: 45000,
    status: 'Partially Paid',
    paidRatio: 0.4,
  },
  {
    id: 'INV-2038',
    patient: {
      name: 'Paolo Mendoza',
      initials: 'PM',
      phone: '+63 919 773 2204',
    },
    treatment: 'Scaling and Polishing',
    createdDate: 'Jun 18, 2026',
    dueDate: 'Jul 2, 2026',
    subtotal: 1200,
    status: 'Paid',
    paidRatio: 1,
  },
  {
    id: 'INV-2039',
    patient: {
      name: 'Grace Villanueva',
      initials: 'GV',
      phone: '+63 947 661 3328',
    },
    treatment: 'Wisdom Tooth Removal',
    createdDate: 'Jun 2, 2026',
    dueDate: 'Jun 16, 2026',
    subtotal: 9500,
    status: 'Overdue',
    paidRatio: 0,
  },
  {
    id: 'INV-2040',
    patient: { name: 'Diego Ramos', initials: 'DR', phone: '+63 928 514 7762' },
    treatment: 'Crown Placement',
    createdDate: 'Jun 17, 2026',
    dueDate: 'Jul 1, 2026',
    subtotal: 12500,
    status: 'Paid',
    paidRatio: 1,
  },
  {
    id: 'INV-2041',
    patient: {
      name: 'Sofia Garcia',
      initials: 'SG',
      phone: '+63 915 330 6647',
    },
    treatment: 'Checkup & Consultation',
    createdDate: 'Jun 16, 2026',
    dueDate: 'Jun 30, 2026',
    subtotal: 500,
    status: 'Paid',
    paidRatio: 1,
  },
  {
    id: 'INV-2042',
    patient: {
      name: 'Miguel Torres',
      initials: 'MT',
      phone: '+63 939 882 1056',
    },
    treatment: 'Veneers',
    createdDate: 'Jun 16, 2026',
    dueDate: 'Jun 30, 2026',
    subtotal: 18000,
    status: 'Unpaid',
    paidRatio: 0,
  },
  {
    id: 'INV-2043',
    patient: { name: 'Isabel Cruz', initials: 'IC', phone: '+63 917 446 9923' },
    treatment: 'Dental Filling',
    createdDate: 'Jun 15, 2026',
    dueDate: 'Jun 29, 2026',
    subtotal: 2000,
    status: 'Paid',
    paidRatio: 1,
  },
  {
    id: 'INV-2044',
    patient: {
      name: 'Rafael Santos',
      initials: 'RS',
      phone: '+63 906 271 5510',
    },
    treatment: 'Root Canal Treatment',
    createdDate: 'Jun 1, 2026',
    dueDate: 'Jun 15, 2026',
    subtotal: 8500,
    status: 'Overdue',
    paidRatio: 0,
  },
  {
    id: 'INV-2045',
    patient: {
      name: 'Camille Aquino',
      initials: 'CA',
      phone: '+63 922 905 3387',
    },
    treatment: 'Tooth Extraction',
    createdDate: 'Jun 14, 2026',
    dueDate: 'Jun 28, 2026',
    subtotal: 3200,
    status: 'Partially Paid',
    paidRatio: 0.6,
  },
  {
    id: 'INV-2046',
    patient: { name: 'Joshua Lim', initials: 'JL', phone: '+63 933 661 4471' },
    treatment: 'Dental Cleaning',
    createdDate: 'Jun 14, 2026',
    dueDate: 'Jun 28, 2026',
    subtotal: 1500,
    status: 'Paid',
    paidRatio: 1,
  },
  {
    id: 'INV-2047',
    patient: {
      name: 'Patricia Gomez',
      initials: 'PG',
      phone: '+63 918 224 6650',
    },
    treatment: 'Braces Adjustment',
    createdDate: 'Jun 13, 2026',
    dueDate: 'Jun 27, 2026',
    subtotal: 1800,
    status: 'Unpaid',
    paidRatio: 0,
  },
  {
    id: 'INV-2048',
    patient: {
      name: 'Andres Dela Cruz',
      initials: 'AD',
      phone: '+63 905 117 8834',
    },
    treatment: 'Dental Implant',
    createdDate: 'Jun 13, 2026',
    dueDate: 'Jun 27, 2026',
    subtotal: 45000,
    status: 'Paid',
    paidRatio: 1,
  },
  {
    id: 'INV-2049',
    patient: {
      name: 'Kristine Navarro',
      initials: 'KN',
      phone: '+63 947 338 2295',
    },
    treatment: 'Teeth Whitening',
    createdDate: 'May 29, 2026',
    dueDate: 'Jun 12, 2026',
    subtotal: 6500,
    status: 'Overdue',
    paidRatio: 0,
  },
  {
    id: 'INV-2050',
    patient: { name: 'Leo Domingo', initials: 'LD', phone: '+63 928 660 1147' },
    treatment: 'Scaling and Polishing',
    createdDate: 'Jun 12, 2026',
    dueDate: 'Jun 26, 2026',
    subtotal: 1200,
    status: 'Paid',
    paidRatio: 1,
  },
  {
    id: 'INV-2051',
    patient: {
      name: 'Angela Pascual',
      initials: 'AP',
      phone: '+63 915 778 3362',
    },
    treatment: 'Crown Placement',
    createdDate: 'Jun 11, 2026',
    dueDate: 'Jun 25, 2026',
    subtotal: 12500,
    status: 'Partially Paid',
    paidRatio: 0.3,
  },
  {
    id: 'INV-2052',
    patient: {
      name: 'Vincent Ocampo',
      initials: 'VO',
      phone: '+63 939 224 6678',
    },
    treatment: 'Checkup & Consultation',
    createdDate: 'Jun 11, 2026',
    dueDate: 'Jun 25, 2026',
    subtotal: 500,
    status: 'Paid',
    paidRatio: 1,
  },
  {
    id: 'INV-2053',
    patient: {
      name: 'Trisha Ramirez',
      initials: 'TR',
      phone: '+63 917 552 9904',
    },
    treatment: 'Wisdom Tooth Removal',
    createdDate: 'Jun 10, 2026',
    dueDate: 'Jun 24, 2026',
    subtotal: 9500,
    status: 'Unpaid',
    paidRatio: 0,
  },
  {
    id: 'INV-2054',
    patient: {
      name: 'Nathaniel Cruz',
      initials: 'NC',
      phone: '+63 906 884 1123',
    },
    treatment: 'Veneers',
    createdDate: 'Jun 10, 2026',
    dueDate: 'Jun 24, 2026',
    subtotal: 18000,
    status: 'Paid',
    paidRatio: 1,
  },
]

export const INVOICES: InvoiceRow[] = SEED.map((seed) => {
  const tax = Math.round(seed.subtotal * TAX_RATE)
  const total = seed.subtotal + tax
  const balance = Math.round(total * (1 - seed.paidRatio))
  return {
    id: seed.id,
    patient: seed.patient,
    treatment: seed.treatment,
    createdDate: seed.createdDate,
    dueDate: seed.dueDate,
    subtotal: seed.subtotal,
    tax,
    total,
    balance,
    status: seed.status,
  }
})

const totalInvoiced = INVOICES.reduce((sum, inv) => sum + inv.total, 0)
const outstandingBalance = INVOICES.reduce((sum, inv) => sum + inv.balance, 0)

export const INVOICES_SUMMARY = {
  totalInvoiced,
  outstandingBalance,
  overdueCount: INVOICES.filter((inv) => inv.status === 'Overdue').length,
  collectionRate: Math.round(
    ((totalInvoiced - outstandingBalance) / totalInvoiced) * 100,
  ),
}
