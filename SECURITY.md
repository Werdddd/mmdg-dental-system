# Security Overview — MMDG Dental System

Last reviewed: 2026-07-17. This document describes the security measures implemented in the codebase as of this date, and lists the known gaps that have not yet been addressed. It is meant to be read alongside the migration history in `supabase/migrations/` and updated whenever security-relevant work lands.

## 1. Authentication

- **No public sign-up.** Accounts are provisioned only by a SuperAdmin or Admin, via the Supabase Admin API (`src/lib/supabase/admin.ts`) with `role`, `clinic_id`, and `full_name` set in `user_metadata`. There is no public registration endpoint.
- **Forced password change on first login.** New accounts are created with a default password (`{FirstName}{LastName}{CurrentYear}`, `src/lib/auth/default-password.ts`), but every provisioned account is flagged `must_change_password = true` (migration `0021_force_password_change.sql`, fixed for the trigger path in `0027`). The app redirects flagged users to `/change-password` before they can reach any other page, so the guessable default password is never usable beyond a single forced reset.
- **Session handling** uses Supabase's SSR cookie-based session (`@supabase/ssr`), refreshed on every request via `src/proxy.ts` → `updateSession` (Next.js 16's `middleware.ts` equivalent). This proxy gates **all** non-public routes — unauthenticated requests are redirected to `/login`, and authenticated users are redirected away from `/login`.
- **Password reset / magic-link callback** (`src/app/auth/callback/route.ts`) exchanges the auth code server-side and only ever redirects to an in-app path (`${origin}${next}`), so the `next` query param can't be used to redirect off-site.

## 2. Authorization & Row-Level Security (RLS)

- **RLS is enabled on every table** that holds patient, clinical, or billing data. Policies use `SECURITY DEFINER` helper functions (`current_user_role()`, `current_user_clinic_id()`, `current_user_is_clinic_staff()`) so policies on `profiles` don't recursively re-trigger themselves.
- **Role model:** `superadmin` (no clinic, full access) / `admin` and `dentist` and other clinic-staff roles (scoped to their clinic via `clinic_staff`, see migration `0026_multi_clinic_staff.sql`).
- **Cross-clinic patient sharing** (migration `0018`) intentionally opens read-only SELECT access to patient/clinical records across clinics (continuity of care), while writes stay pinned to `clinic_id = current_user_clinic_id()`. Billing tables (`invoices`, `payments`, `invoice_items`, `sponsors`) were deliberately left out of this migration and remain clinic-siloed.
- **App-level authorization** on top of RLS: server actions such as `documents/actions.ts` and `superadmin-actions.ts` add explicit role checks before mutating data, rather than relying on RLS alone.
- **Service-role key isolation:** `SUPABASE_SERVICE_ROLE_KEY` (used only for admin operations like account provisioning) is a server-only env var — never prefixed `NEXT_PUBLIC_`, and `createAdminClient()` is only imported from `'use server'` action files, never from client components.

## 3. Data Integrity

- **Concurrent payment overpay guard:** the payment-validation trigger reads `invoices.balance` with `FOR UPDATE` (migration `0022_lock_invoice_on_payment_validate.sql`), preventing two simultaneous payments from both passing validation against a stale balance.
- **Atomic invoice generation:** `generateInvoice` was moved into a single-transaction Postgres RPC (`generate_invoice`, migrations `0024`/`0025`), eliminating a prior window where a failure mid-generation could leave a $0 "ghost" invoice.
- **Double-booking guard:** enforced at two layers — an app-level pre-check, and a partial unique index `appointments_dentist_slot_unique` on `(dentist_id, scheduled_at)` excluding Cancelled/No Show/Rescheduled statuses (migration `0023`).
- **Appointment status state machine** is enforced server-side in `updateAppointmentStatus`, reusing the same `VALID_TRANSITIONS` map the UI uses, so the transition rules can't be bypassed by calling the server action directly.
- **Treatment cost validation:** `createTreatmentRecord` / `createTreatmentRecordForTooth` reject non-finite or negative costs.
- **Payment signature capture:** Add Payment requires a patient signature acknowledging the treatment log before the payment is recorded (migration `0028_payment_signature.sql`).

## 4. Error Handling & Information Disclosure

- `src/lib/errors.ts` centralizes error handling for server actions: an `AppError` class for intentional, curated user-facing messages, and `toActionErrorMessage()`, which allowlists Supabase `AuthError` (already curated) but replaces any raw Postgres/Supabase error with a generic message — logging the real error server-side instead of leaking schema or constraint details to the client. Applied across clinics/superadmin/documents/patients/profile/change-password actions.

## 5. Secrets & Configuration

- `.env` / `.env.local` are git-ignored; no secrets are committed to the repository.
- No `dangerouslySetInnerHTML` usage anywhere in the codebase (XSS surface via raw HTML injection is not present).
- **Deployment gate — verify before every production deploy:** `isSupabaseConfigured` (`src/lib/supabase/config.ts`) intentionally disables **all** auth gating and RLS-backed login whenever `NEXT_PUBLIC_SUPABASE_URL` is unset or contains the string `"placeholder"` — this exists to allow UI preview before Supabase is wired up locally. If this env var is ever missing or left as a placeholder in a production environment, the entire app (including patient data) is served with no authentication and no error raised. **This must be manually confirmed on every deploy.**

## 6. Build/Type Safety

- `tsc --noEmit` and `next build` both pass cleanly as of the last audit — no type errors or build-time warnings masking bugs.

---

## Known Gaps (not yet addressed)

These were identified in the 2026-07-09 audit and have not been requested/fixed since:

1. **`treatment_records.cost` is exposed cross-clinic.** Migration `0018`'s cross-clinic SELECT policy on `treatment_records` includes the `cost` column, despite the migration's own comment stating billing should stay clinic-siloed. A clinic can currently see the price another clinic charged for a shared patient's treatment.
2. **Unscoped cross-clinic `profiles` policy.** "Clinic staff can view profiles in any clinic" (migration `0018`) lets any clinic-staff role read the full multi-clinic staff directory. Not currently reachable from any UI, but the policy itself has no restriction.
3. **Some patient-record delete actions rely solely on RLS**, with no app-level role check (unlike `documents/actions.ts` and `superadmin-actions.ts`, which check explicitly).
4. **No audit trail on consent / radiograph-release signature forms** — they're mutably upserted with client-supplied dates, so a prior signature can be overwritten with no history.
5. **`recalculate_invoice_totals` RPC's execute grant** hasn't been reviewed/tightened.
6. **No MIME-type sniffing/validation on file uploads** (patient photos, dental chart photos, documents) — content type is trusted as supplied by the client.

## Recommended Pre-Launch Checklist

- [ ] Confirm `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are set to real production values in the hosting provider's environment config (not placeholders) — see §5.
- [ ] Decide whether the `treatment_records.cost` and `profiles` cross-clinic exposures (Gaps #1–2) are acceptable for launch or need a migration before go-live.
- [ ] Add MIME validation on upload endpoints if patient-submitted files are exposed to other users (Gap #6).
- [ ] Rotate `SUPABASE_SERVICE_ROLE_KEY` if it was ever shared/logged during development.
- [ ] Confirm Supabase project-level settings: email confirmation requirements, rate limiting on auth endpoints, and backup schedule — these are dashboard settings, not code, and aren't covered by this repo.
