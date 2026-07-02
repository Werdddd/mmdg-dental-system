-- Receptionist and Dental Assistant get the same clinic-scoped access as
-- Admin and Dentist. Rather than repeating a 4-way role list in every
-- clinic-scoped policy, add one helper (mirrors current_user_role() /
-- current_user_clinic_id() from 0001) and repoint every existing
-- "current_user_role() in ('admin', 'dentist')" policy at it.

create function public.current_user_is_clinic_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.current_user_role() in ('admin', 'dentist', 'receptionist', 'dental_assistant');
$$;

-- Profiles requires a clinic_id for every non-superadmin role.
alter table public.profiles drop constraint profiles_role_clinic_check;
alter table public.profiles add constraint profiles_role_clinic_check check (
  (role = 'superadmin' and clinic_id is null)
  or (role in ('admin', 'dentist', 'receptionist', 'dental_assistant') and clinic_id is not null)
);

-- 0001: profiles
alter policy "Admins can read profiles in their clinic"
  on public.profiles
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );

alter policy "Admins can update profiles in their clinic"
  on public.profiles
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );

-- 0002: patients, appointments, invoices, payments
alter policy "Clinic staff can manage patients in their clinic"
  on public.patients
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );

alter policy "Clinic staff can manage appointments in their clinic"
  on public.appointments
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );

alter policy "Clinic staff can manage invoices in their clinic"
  on public.invoices
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );

alter policy "Clinic staff can manage payments in their clinic"
  on public.payments
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );

-- 0005: patient notes
alter policy "Clinic staff can manage patient notes in their clinic"
  on public.patient_notes
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );

-- 0006: dental chart / branch tags / photos (storage.objects policies are
-- already role-agnostic — clinic match only — so they don't need changes)
alter policy "Clinic staff can manage tooth records in their clinic"
  on public.tooth_records
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );

alter policy "Clinic staff can manage patient branch tags in their clinic"
  on public.patient_branch_tags
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );

alter policy "Clinic staff can manage dental chart photos in their clinic"
  on public.dental_chart_photos
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );

-- 0007: sponsors, patient sponsorships, treatment records, invoice items
alter policy "Clinic staff can manage sponsors in their clinic"
  on public.sponsors
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );

alter policy "Clinic staff can manage patient sponsorships in their clinic"
  on public.patient_sponsorships
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );

alter policy "Clinic staff can manage treatment records in their clinic"
  on public.treatment_records
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );

alter policy "Clinic staff can manage invoice items in their clinic"
  on public.invoice_items
  using (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_is_clinic_staff()
    and clinic_id = public.current_user_clinic_id()
  );
