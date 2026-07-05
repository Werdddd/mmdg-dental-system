-- Per-patient document attachments (valid IDs, referral letters, insurance
-- cards, lab results, etc.) — distinct from the global admin-only document
-- library (0017_documents.sql) and from dental-chart-photos (tooth-scoped
-- clinical photos). Every upload requires a caption/note describing what it
-- is. Follows the same clinic-scoped-write + cross-clinic-read pattern as
-- the rest of a shared patient's chart (0018_cross_clinic_patient_visibility.sql).

create table public.patient_documents (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  name text not null,
  storage_path text not null,
  file_type text not null,
  file_size bigint not null,
  caption text not null check (char_length(trim(caption)) > 0),
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index patient_documents_clinic_id_idx on public.patient_documents (clinic_id);
create index patient_documents_patient_id_idx on public.patient_documents (patient_id);

alter table public.patient_documents enable row level security;

create policy "Superadmins can manage all patient documents"
  on public.patient_documents for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Clinic staff can manage patient documents in their clinic"
  on public.patient_documents for all
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );

create policy "Clinic staff can view patient documents in any clinic"
  on public.patient_documents for select
  using (public.current_user_is_clinic_staff());

insert into storage.buckets (id, name, public)
values ('patient-documents', 'patient-documents', false)
on conflict (id) do nothing;

create policy "Clinic staff can read patient documents in their clinic"
  on storage.objects for select
  using (
    bucket_id = 'patient-documents'
    and (
      public.current_user_role() = 'superadmin'
      or public.current_user_is_clinic_staff()
      or (storage.foldername(name))[1] = public.current_user_clinic_id()::text
    )
  );

create policy "Clinic staff can upload patient documents in their clinic"
  on storage.objects for insert
  with check (
    bucket_id = 'patient-documents'
    and (
      public.current_user_role() = 'superadmin'
      or (storage.foldername(name))[1] = public.current_user_clinic_id()::text
    )
  );

create policy "Clinic staff can delete patient documents in their clinic"
  on storage.objects for delete
  using (
    bucket_id = 'patient-documents'
    and (
      public.current_user_role() = 'superadmin'
      or (storage.foldername(name))[1] = public.current_user_clinic_id()::text
    )
  );
