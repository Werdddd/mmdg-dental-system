-- Real dental charting: per-tooth condition records (replacing the
-- patient-detail page's seeded-random chart), per-patient treatment-branch
-- tags (Orthodontics, Oral Surgery, etc.), and uploaded chart photos
-- (intraoral photos / X-rays) stored in a private Storage bucket.

create type public.tooth_condition as enum (
  'Healthy',
  'Cavity',
  'Filled',
  'Crown',
  'Root Canal',
  'Missing'
);

create table public.tooth_records (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  tooth smallint not null check (tooth between 1 and 32),
  condition public.tooth_condition not null default 'Healthy',
  treatment_performed text,
  notes text,
  dentist_id uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (patient_id, tooth)
);

create index tooth_records_clinic_id_idx on public.tooth_records (clinic_id);
create index tooth_records_patient_id_idx on public.tooth_records (patient_id);

alter table public.tooth_records enable row level security;

create policy "Superadmins can manage all tooth records"
  on public.tooth_records for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Clinic staff can manage tooth records in their clinic"
  on public.tooth_records for all
  using (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  );

-- Treatment-branch tags (e.g. a patient under both Orthodontics and Oral
-- Surgery care gets both tags). Fixed enum keeps tags consistent instead of
-- free text drifting into "Ortho" / "Orthodontics" / "ortho" variants.
create type public.clinic_branch as enum (
  'General Dentistry',
  'Orthodontics',
  'Oral Surgery',
  'Periodontics',
  'Pediatric Dentistry',
  'Endodontics',
  'Prosthodontics',
  'Cosmetic Dentistry'
);

create table public.patient_branch_tags (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  branch public.clinic_branch not null,
  created_at timestamptz not null default now(),
  unique (patient_id, branch)
);

create index patient_branch_tags_clinic_id_idx on public.patient_branch_tags (clinic_id);
create index patient_branch_tags_patient_id_idx on public.patient_branch_tags (patient_id);

alter table public.patient_branch_tags enable row level security;

create policy "Superadmins can manage all patient branch tags"
  on public.patient_branch_tags for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Clinic staff can manage patient branch tags in their clinic"
  on public.patient_branch_tags for all
  using (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  );

-- Dental chart photos (intraoral photos, X-rays). tooth is nullable for
-- whole-mouth/panoramic shots not tied to one tooth.
create table public.dental_chart_photos (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  tooth smallint check (tooth between 1 and 32),
  storage_path text not null,
  caption text,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index dental_chart_photos_clinic_id_idx on public.dental_chart_photos (clinic_id);
create index dental_chart_photos_patient_id_idx on public.dental_chart_photos (patient_id);

alter table public.dental_chart_photos enable row level security;

create policy "Superadmins can manage all dental chart photos"
  on public.dental_chart_photos for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Clinic staff can manage dental chart photos in their clinic"
  on public.dental_chart_photos for all
  using (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  );

-- Private storage bucket for the photos above. Objects are stored under
-- `{clinic_id}/{patient_id}/{filename}` so storage.objects RLS can scope
-- access by clinic the same way the clinical tables do.
insert into storage.buckets (id, name, public)
values ('dental-chart-photos', 'dental-chart-photos', false)
on conflict (id) do nothing;

create policy "Clinic staff can read dental chart photos in their clinic"
  on storage.objects for select
  using (
    bucket_id = 'dental-chart-photos'
    and (
      public.current_user_role() = 'superadmin'
      or (storage.foldername(name))[1] = public.current_user_clinic_id()::text
    )
  );

create policy "Clinic staff can upload dental chart photos in their clinic"
  on storage.objects for insert
  with check (
    bucket_id = 'dental-chart-photos'
    and (
      public.current_user_role() = 'superadmin'
      or (storage.foldername(name))[1] = public.current_user_clinic_id()::text
    )
  );

create policy "Clinic staff can delete dental chart photos in their clinic"
  on storage.objects for delete
  using (
    bucket_id = 'dental-chart-photos'
    and (
      public.current_user_role() = 'superadmin'
      or (storage.foldername(name))[1] = public.current_user_clinic_id()::text
    )
  );
