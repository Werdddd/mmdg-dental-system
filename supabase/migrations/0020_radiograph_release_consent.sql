-- Radiograph Release of Liability form: shown after a patient's first
-- appointment is scheduled, prompting sign-off on which radiographs
-- (CBCT / Panoramic / PFM) were recommended, and — if the patient declines
-- them — a liability release naming the treating dentist. One row per
-- patient, editable in place, same shape as patient_consent_forms.

create table public.patient_radiograph_consents (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  patient_id uuid not null unique references public.patients (id) on delete cascade,
  radiograph_cbct boolean not null default false,
  radiograph_panoramic boolean not null default false,
  radiograph_pfm boolean not null default false,
  dentist_name text,
  patient_signature_type text check (patient_signature_type in ('drawn', 'typed')),
  patient_signature_data text,
  witness_signature_type text check (witness_signature_type in ('drawn', 'typed')),
  witness_signature_data text,
  witness_printed_name text,
  signed_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null
);

create index patient_radiograph_consents_clinic_id_idx on public.patient_radiograph_consents (clinic_id);
create index patient_radiograph_consents_patient_id_idx on public.patient_radiograph_consents (patient_id);

alter table public.patient_radiograph_consents enable row level security;

create policy "Superadmins can manage all patient radiograph consents"
  on public.patient_radiograph_consents for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Clinic staff can manage patient radiograph consents in their clinic"
  on public.patient_radiograph_consents for all
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );

create policy "Clinic staff can view patient radiograph consents in any clinic"
  on public.patient_radiograph_consents for select
  using (public.current_user_is_clinic_staff());
