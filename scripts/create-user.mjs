#!/usr/bin/env node
// Provisions a SuperAdmin/Admin/Dentist account correctly — i.e. with the
// role/clinic_id metadata the handle_new_user trigger (0001 migration)
// needs at the moment the user is created.
//
// The Supabase Dashboard's "Add user" dialog can't do this: it has no way
// to set user_metadata at creation time, and the trigger requires it
// immediately (it runs inside the same transaction as the auth.users
// insert), so any user created there fails a check constraint before it's
// ever usable. This script is the supported way to create accounts.
//
// Usage:
//   npm run create-user -- --email=jane@mmdg.com --password=secret123 \
//     --full-name="Jane Doe" --role=dentist --clinic="Default Clinic" \
//     --specialty="General Dentist"
//
// --role superadmin doesn't need --clinic. --clinic accepts either an
// existing clinic's UUID or name (matched case-insensitively); if no
// clinic matches that name, one is created with it.
//
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (Supabase Dashboard >
// Project Settings > API — never commit it).

import { createClient } from '@supabase/supabase-js'

function parseArgs(argv) {
  const args = {}
  for (const arg of argv) {
    const match = /^--([^=]+)=(.*)$/.exec(arg)
    if (match) args[match[1]] = match[2]
  }
  return args
}

const args = parseArgs(process.argv.slice(2))

function usageAndExit(message) {
  if (message) console.error(message + '\n')
  console.error(
    'Usage: npm run create-user -- --email=<email> --password=<password> ' +
      '--full-name="<name>" --role=<superadmin|admin|dentist> ' +
      '[--clinic=<name-or-uuid>] [--specialty="<specialty>"]',
  )
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Add SUPABASE_SERVICE_ROLE_KEY=<service_role key> to .env.local\n' +
      '(Supabase Dashboard > Project Settings > API), then re-run.',
  )
  process.exit(1)
}

const { email, password, role, specialty } = args
const fullName = args['full-name']
const clinicArg = args.clinic

if (!email || !password || !fullName || !role) {
  usageAndExit('Missing required argument(s).')
}
if (!['superadmin', 'admin', 'dentist'].includes(role)) {
  usageAndExit(`--role must be superadmin, admin, or dentist (got "${role}").`)
}
if (role !== 'superadmin' && !clinicArg) {
  usageAndExit(`--clinic is required for role "${role}".`)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function resolveClinicId(clinic) {
  if (UUID_RE.test(clinic)) return clinic

  const { data: existing, error } = await supabase
    .from('clinics')
    .select('id, name')
    .ilike('name', clinic)
    .maybeSingle()
  if (error) throw error
  if (existing) return existing.id

  const { data: created, error: createError } = await supabase
    .from('clinics')
    .insert({ name: clinic })
    .select('id')
    .single()
  if (createError) throw createError
  console.log(`Created new clinic "${clinic}" (id: ${created.id})`)
  return created.id
}

async function main() {
  const clinicId = role === 'superadmin' ? null : await resolveClinicId(clinicArg)

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role,
      ...(clinicId ? { clinic_id: clinicId } : {}),
    },
  })

  if (error) {
    console.error('Failed to create user:', error.message)
    process.exit(1)
  }

  if (role === 'dentist' && specialty) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ specialty })
      .eq('id', data.user.id)
    if (updateError) throw updateError
  }

  console.log(`Created ${role}: ${data.user.email} (id: ${data.user.id})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
