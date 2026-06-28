-- Patient profile fields (About + Chief Complaint) and a notes log, so the
-- Patients detail page can show and edit real data instead of mock/random
-- values. No blood type column — explicitly dropped from the UI/forms.

alter table public.patients
  add column email text,
  add column nationality text,
  add column civil_status text,
  add column emergency_contact_name text,
  add column emergency_contact_relation text,
  add column emergency_contact_phone text,
  add column chief_complaint text,
  add column symptoms text,
  add column affected_area text,
  add column complaint_remarks text;

create table public.patient_notes (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index patient_notes_clinic_id_idx on public.patient_notes (clinic_id);
create index patient_notes_patient_id_idx on public.patient_notes (patient_id);

alter table public.patient_notes enable row level security;

create policy "Superadmins can manage all patient notes"
  on public.patient_notes for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Clinic staff can manage patient notes in their clinic"
  on public.patient_notes for all
  using (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  );
