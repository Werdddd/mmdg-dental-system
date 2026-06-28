import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
)

const id = 'd9ff6bdb-e832-4b7c-b02b-e7b24826ce7e'

const PATIENT_SELECT = `
  id, full_name, gender, birthday, address, phone, treatment_status, created_at,
  email, nationality, civil_status,
  emergency_contact_name, emergency_contact_relation, emergency_contact_phone,
  chief_complaint, symptoms, affected_area, complaint_remarks,
  appointments ( scheduled_at, notes )
`

const r1 = await supabase
  .from('patients')
  .select(PATIENT_SELECT)
  .eq('id', id)
  .single()
console.log('patients query error:', r1.error)

const r2 = await supabase
  .from('appointments')
  .select('id, scheduled_at, notes, status, dentist:profiles ( full_name )')
  .eq('patient_id', id)
console.log('appointments query error:', r2.error)

const NOTE_SELECT = `
  id, content, created_at, updated_at,
  author:profiles ( full_name )
`
const r3 = await supabase
  .from('patient_notes')
  .select(NOTE_SELECT)
  .eq('patient_id', id)
console.log('patient_notes query error:', r3.error)
