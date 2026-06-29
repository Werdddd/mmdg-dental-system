// Treatment-branch tags a patient can carry in the dental chart (e.g. a
// patient under both Orthodontics and Oral Surgery care). Mirrors the
// `clinic_branch` enum in 0006_dental_chart_branches_photos.sql — keep both
// in sync.

export const CLINIC_BRANCHES = [
  'General Dentistry',
  'Orthodontics',
  'Oral Surgery',
  'Periodontics',
  'Pediatric Dentistry',
  'Endodontics',
  'Prosthodontics',
  'Cosmetic Dentistry',
] as const

export type ClinicBranch = (typeof CLINIC_BRANCHES)[number]
