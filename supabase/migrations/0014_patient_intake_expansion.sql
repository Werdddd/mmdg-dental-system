-- Expands patient registration into a full clinical intake: split name
-- fields, richer contact/demographic info, a fuller dental-visit section,
-- a structured medical history questionnaire, a consent & waiver form, and
-- record-lifecycle metadata (status, created/updated by, internal remarks).

-- ---------------------------------------------------------------------
-- Patient Information — name split + contact/demographic additions
-- ---------------------------------------------------------------------

alter table public.patients
  add column first_name text,
  add column middle_name text,
  add column last_name text,
  add column suffix text;

create type public.preferred_contact_method as enum (
  'SMS',
  'Phone Call',
  'Email',
  'Facebook Messenger',
  'WhatsApp',
  'Viber',
  'Other'
);

alter table public.patients
  add column telephone_number text,
  add column preferred_contact_method public.preferred_contact_method,
  add column occupation text;

-- full_name stays the column every other query/search already reads;
-- it's now derived from the split name fields whenever they're supplied,
-- so nothing downstream (search, invoices, appointments) needs to change.
create function public.trg_patients_set_full_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.first_name is not null or new.middle_name is not null
     or new.last_name is not null or new.suffix is not null then
    new.full_name := trim(
      regexp_replace(
        concat_ws(' ', new.first_name, new.middle_name, new.last_name, new.suffix),
        '\s+', ' ', 'g'
      )
    );
  end if;
  return new;
end;
$$;

create trigger patients_set_full_name
  before insert or update on public.patients
  for each row execute function public.trg_patients_set_full_name();

-- ---------------------------------------------------------------------
-- Dental Visit Information additions
-- ---------------------------------------------------------------------

alter table public.patients
  add column history_of_present_illness text,
  add column initial_clinical_findings text,
  add column diagnosis text,
  add column treatment_recommendations text;

-- ---------------------------------------------------------------------
-- System Metadata
-- ---------------------------------------------------------------------

create type public.patient_record_status as enum (
  'Active',
  'Inactive',
  'Archived'
);

alter table public.patients
  add column record_status public.patient_record_status not null default 'Active',
  add column created_by uuid references public.profiles (id) on delete set null,
  add column updated_by uuid references public.profiles (id) on delete set null,
  add column updated_at timestamptz not null default now(),
  add column internal_remarks text;

-- ---------------------------------------------------------------------
-- Medical History Questionnaire (one row per patient)
-- ---------------------------------------------------------------------

create table public.patient_medical_history (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  patient_id uuid not null unique references public.patients (id) on delete cascade,
  general_responses jsonb not null default '{}'::jsonb,
  additional_responses jsonb not null default '{}'::jsonb,
  women_only_responses jsonb not null default '{}'::jsonb,
  conditions jsonb not null default '{}'::jsonb,
  patient_signature_type text check (patient_signature_type in ('drawn', 'typed')),
  patient_signature_data text,
  signed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null
);

create index patient_medical_history_clinic_id_idx on public.patient_medical_history (clinic_id);
create index patient_medical_history_patient_id_idx on public.patient_medical_history (patient_id);

alter table public.patient_medical_history enable row level security;

create policy "Superadmins can manage all patient medical history"
  on public.patient_medical_history for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Clinic staff can manage patient medical history in their clinic"
  on public.patient_medical_history for all
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );

-- ---------------------------------------------------------------------
-- Consent & Waiver Form (one row per patient, editable in place)
-- ---------------------------------------------------------------------

create table public.patient_consent_forms (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  patient_id uuid not null unique references public.patients (id) on delete cascade,
  clinic_name text,
  dentist_name text,
  procedures_description text,
  disposal_clinic_name text,
  patient_signature_type text check (patient_signature_type in ('drawn', 'typed')),
  patient_signature_data text,
  patient_printed_name text,
  patient_signed_date date,
  witness_signature_type text check (witness_signature_type in ('drawn', 'typed')),
  witness_signature_data text,
  witness_printed_name text,
  witness_signed_date date,
  guardian_signature_type text check (guardian_signature_type in ('drawn', 'typed')),
  guardian_signature_data text,
  guardian_printed_name text,
  guardian_signed_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null
);

create index patient_consent_forms_clinic_id_idx on public.patient_consent_forms (clinic_id);
create index patient_consent_forms_patient_id_idx on public.patient_consent_forms (patient_id);

alter table public.patient_consent_forms enable row level security;

create policy "Superadmins can manage all patient consent forms"
  on public.patient_consent_forms for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Clinic staff can manage patient consent forms in their clinic"
  on public.patient_consent_forms for all
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );
