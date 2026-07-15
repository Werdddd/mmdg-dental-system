-- Multi-clinic staff membership.
--
-- Business need: the same staff member (one auth account / one email) can
-- now belong to more than one clinic. Role stays global per person (not
-- per-clinic-membership) — simpler, and matches the existing role picker.
--
-- Replaces the single `profiles.clinic_id` column with a `clinic_staff`
-- join table (same many-to-many shape as `patient_branch_tags`), and
-- repoints every clinic-scoped RLS policy's `clinic_id =
-- current_user_clinic_id()` equality check at a new
-- `current_user_can_access_clinic()` membership-existence check.

-- ---------------------------------------------------------------------
-- 1. Join table
-- ---------------------------------------------------------------------

create table public.clinic_staff (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, clinic_id)
);

create index clinic_staff_profile_id_idx on public.clinic_staff (profile_id);
create index clinic_staff_clinic_id_idx on public.clinic_staff (clinic_id);

-- Backfill existing 1:1 memberships before the old column is dropped.
insert into public.clinic_staff (profile_id, clinic_id)
select id, clinic_id from public.profiles where clinic_id is not null
on conflict do nothing;

alter table public.clinic_staff enable row level security;

create policy "Superadmins can manage clinic_staff"
  on public.clinic_staff for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Clinic staff can view clinic_staff"
  on public.clinic_staff for select
  using (public.current_user_is_clinic_staff());

-- ---------------------------------------------------------------------
-- 2. Membership-aware helper, replacing scalar current_user_clinic_id()
-- ---------------------------------------------------------------------

create function public.current_user_can_access_clinic(target_clinic_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.clinic_staff cs
    where cs.profile_id = auth.uid() and cs.clinic_id = target_clinic_id
  );
$$;

-- ---------------------------------------------------------------------
-- 3. Repoint every "manage" (write) policy that compared a row's
--    clinic_id column to current_user_clinic_id() at the new helper.
-- ---------------------------------------------------------------------

alter policy "Clinic staff can manage patients in their clinic"
  on public.patients
  using (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  )
  with check (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  );

alter policy "Clinic staff can manage appointments in their clinic"
  on public.appointments
  using (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  )
  with check (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  );

alter policy "Clinic staff can manage invoices in their clinic"
  on public.invoices
  using (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  )
  with check (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  );

alter policy "Clinic staff can manage payments in their clinic"
  on public.payments
  using (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  )
  with check (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  );

alter policy "Clinic staff can manage patient notes in their clinic"
  on public.patient_notes
  using (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  )
  with check (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  );

alter policy "Clinic staff can manage tooth records in their clinic"
  on public.tooth_records
  using (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  )
  with check (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  );

alter policy "Clinic staff can manage patient branch tags in their clinic"
  on public.patient_branch_tags
  using (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  )
  with check (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  );

alter policy "Clinic staff can manage dental chart photos in their clinic"
  on public.dental_chart_photos
  using (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  )
  with check (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  );

-- Note: `sponsors` and `patient_sponsorships` (from 0007) were dropped by
-- 0012_remove_sponsor_orgs.sql, so there's nothing to alter here for them.

alter policy "Clinic staff can manage treatment records in their clinic"
  on public.treatment_records
  using (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  )
  with check (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  );

alter policy "Clinic staff can manage invoice items in their clinic"
  on public.invoice_items
  using (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  )
  with check (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  );

alter policy "Clinic staff can manage patient medical history in their clinic"
  on public.patient_medical_history
  using (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  )
  with check (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  );

alter policy "Clinic staff can manage patient consent forms in their clinic"
  on public.patient_consent_forms
  using (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  )
  with check (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  );

alter policy "Clinic staff can manage patient documents in their clinic"
  on public.patient_documents
  using (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  )
  with check (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  );

alter policy "Clinic staff can manage patient radiograph consents in their clinic"
  on public.patient_radiograph_consents
  using (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  )
  with check (
    public.current_user_is_clinic_staff()
    and public.current_user_can_access_clinic(clinic_id)
  );

-- ---------------------------------------------------------------------
-- 4. profiles: these compare the *target row's* clinic to the caller's,
--    so they need a membership self-join rather than a straight swap.
-- ---------------------------------------------------------------------

alter policy "Admins can read profiles in their clinic"
  on public.profiles
  using (
    public.current_user_is_clinic_staff()
    and exists (
      select 1 from public.clinic_staff mine
      join public.clinic_staff theirs on theirs.clinic_id = mine.clinic_id
      where mine.profile_id = auth.uid() and theirs.profile_id = profiles.id
    )
  );

alter policy "Admins can update profiles in their clinic"
  on public.profiles
  using (
    public.current_user_is_clinic_staff()
    and exists (
      select 1 from public.clinic_staff mine
      join public.clinic_staff theirs on theirs.clinic_id = mine.clinic_id
      where mine.profile_id = auth.uid() and theirs.profile_id = profiles.id
    )
  )
  with check (
    public.current_user_is_clinic_staff()
    and exists (
      select 1 from public.clinic_staff mine
      join public.clinic_staff theirs on theirs.clinic_id = mine.clinic_id
      where mine.profile_id = auth.uid() and theirs.profile_id = profiles.id
    )
  );

-- Superseded by 0018's "Clinic staff can view all clinics" (unconditional
-- cross-clinic read) — drop rather than rewrite.
drop policy "Admins and dentists can read their own clinic" on public.clinics;

-- ---------------------------------------------------------------------
-- 5. Storage bucket policies keyed on the {clinic_id}/{filename} folder
--    convention. The 3 SELECT policies already broadened by 0018 have a
--    dead clinic-match clause behind an unconditional OR — drop it there.
--    Upload/delete stay clinic-pinned, so they get the membership swap.
-- ---------------------------------------------------------------------

alter policy "Clinic staff can read dental chart photos in their clinic"
  on storage.objects
  using (
    bucket_id = 'dental-chart-photos'
    and (
      public.current_user_role() = 'superadmin'
      or public.current_user_is_clinic_staff()
    )
  );

alter policy "Clinic staff can upload dental chart photos in their clinic"
  on storage.objects
  with check (
    bucket_id = 'dental-chart-photos'
    and (
      public.current_user_role() = 'superadmin'
      or public.current_user_can_access_clinic((storage.foldername(name))[1]::uuid)
    )
  );

alter policy "Clinic staff can delete dental chart photos in their clinic"
  on storage.objects
  using (
    bucket_id = 'dental-chart-photos'
    and (
      public.current_user_role() = 'superadmin'
      or public.current_user_can_access_clinic((storage.foldername(name))[1]::uuid)
    )
  );

alter policy "Clinic staff can read payment proofs in their clinic"
  on storage.objects
  using (
    bucket_id = 'payment-proofs'
    and (
      public.current_user_role() = 'superadmin'
      or public.current_user_can_access_clinic((storage.foldername(name))[1]::uuid)
    )
  );

alter policy "Clinic staff can upload payment proofs in their clinic"
  on storage.objects
  with check (
    bucket_id = 'payment-proofs'
    and (
      public.current_user_role() = 'superadmin'
      or public.current_user_can_access_clinic((storage.foldername(name))[1]::uuid)
    )
  );

alter policy "Clinic staff can delete payment proofs in their clinic"
  on storage.objects
  using (
    bucket_id = 'payment-proofs'
    and (
      public.current_user_role() = 'superadmin'
      or public.current_user_can_access_clinic((storage.foldername(name))[1]::uuid)
    )
  );

alter policy "Clinic staff can read patient photos in their clinic"
  on storage.objects
  using (
    bucket_id = 'patient-photos'
    and (
      public.current_user_role() = 'superadmin'
      or public.current_user_is_clinic_staff()
    )
  );

alter policy "Clinic staff can upload patient photos in their clinic"
  on storage.objects
  with check (
    bucket_id = 'patient-photos'
    and (
      public.current_user_role() = 'superadmin'
      or public.current_user_can_access_clinic((storage.foldername(name))[1]::uuid)
    )
  );

alter policy "Clinic staff can delete patient photos in their clinic"
  on storage.objects
  using (
    bucket_id = 'patient-photos'
    and (
      public.current_user_role() = 'superadmin'
      or public.current_user_can_access_clinic((storage.foldername(name))[1]::uuid)
    )
  );

alter policy "Clinic staff can read patient documents in their clinic"
  on storage.objects
  using (
    bucket_id = 'patient-documents'
    and (
      public.current_user_role() = 'superadmin'
      or public.current_user_is_clinic_staff()
    )
  );

alter policy "Clinic staff can upload patient documents in their clinic"
  on storage.objects
  with check (
    bucket_id = 'patient-documents'
    and (
      public.current_user_role() = 'superadmin'
      or public.current_user_can_access_clinic((storage.foldername(name))[1]::uuid)
    )
  );

alter policy "Clinic staff can delete patient documents in their clinic"
  on storage.objects
  using (
    bucket_id = 'patient-documents'
    and (
      public.current_user_role() = 'superadmin'
      or public.current_user_can_access_clinic((storage.foldername(name))[1]::uuid)
    )
  );

-- ---------------------------------------------------------------------
-- 6. New-user provisioning: insert into clinic_staff instead of setting
--    profiles.clinic_id.
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_clinic_id uuid;
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'dentist')
  );

  meta_clinic_id := (new.raw_user_meta_data ->> 'clinic_id')::uuid;
  if meta_clinic_id is not null then
    insert into public.clinic_staff (profile_id, clinic_id)
    values (new.id, meta_clinic_id)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 7. Drop what's now unused: the role/clinic check constraint tied to
--    the single-clinic column, the column itself, and the scalar helper.
-- ---------------------------------------------------------------------

alter table public.profiles drop constraint profiles_role_clinic_check;
alter table public.profiles drop column clinic_id;
drop function public.current_user_clinic_id();
