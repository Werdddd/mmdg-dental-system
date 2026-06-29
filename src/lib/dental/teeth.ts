// Universal Numbering System (1-32), shared by the dental chart's data
// layer (server) and panel (client) so tooth labels/arches stay in sync.

export type ToothCondition =
  | 'Healthy'
  | 'Cavity'
  | 'Filled'
  | 'Crown'
  | 'Root Canal'
  | 'Missing'

export const TOOTH_CONDITIONS: ToothCondition[] = [
  'Healthy',
  'Cavity',
  'Filled',
  'Crown',
  'Root Canal',
  'Missing',
]

export const UPPER_ARCH = Array.from({ length: 16 }, (_, i) => i + 1)
export const LOWER_ARCH = Array.from({ length: 16 }, (_, i) => 32 - i)

const TOOTH_NAMES_BY_POSITION = [
  'Third Molar',
  'Second Molar',
  'First Molar',
  'Second Premolar',
  'First Premolar',
  'Canine',
  'Lateral Incisor',
  'Central Incisor',
]

function toothInfo(tooth: number) {
  if (tooth >= 1 && tooth <= 8) {
    return { quadrant: 'Upper Right', name: TOOTH_NAMES_BY_POSITION[tooth - 1] }
  }
  if (tooth >= 9 && tooth <= 16) {
    return { quadrant: 'Upper Left', name: TOOTH_NAMES_BY_POSITION[16 - tooth] }
  }
  if (tooth >= 17 && tooth <= 24) {
    return { quadrant: 'Lower Left', name: TOOTH_NAMES_BY_POSITION[tooth - 17] }
  }
  return { quadrant: 'Lower Right', name: TOOTH_NAMES_BY_POSITION[32 - tooth] }
}

export function formatToothLabel(tooth: number) {
  const { quadrant, name } = toothInfo(tooth)
  return `Tooth #${tooth} (${quadrant} ${name})`
}
