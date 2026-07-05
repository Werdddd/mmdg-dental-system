-- Cross-clinic patient sharing.
--
-- Business need: any clinic's staff (Admin/Dentist/Receptionist/Dental
-- Assistant) should be able to search, view, and log treatment for a
-- patient registered at a DIFFERENT clinic, so shared patients get
-- continuity of care across MMDG's clinics. Billing must stay private per
-- clinic, so invoices/payments/invoice_items/sponsors/patient_sponsorships
-- are deliberately left untouched by this migration.
--
-- Approach: every clinical table already has an "ALL" (manage) policy
-- scoped to `current_user_is_clinic_staff() and clinic_id =
-- current_user_clinic_id()` — that stays as-is, so writes remain
-- clinic-pinned. This migration adds one additional SELECT-only, no
-- clinic-match policy per table, so reads become cross-clinic while writes
-- don't. `treatment_records` already has no cross-clinic write restriction
-- beyond "insert under your own clinic_id" (no patient-clinic match check),
-- so once patients/treatment_records become cross-clinic readable, logging
-- a treatment for another clinic's patient already works with zero
-- additional policy changes there.

create policy "Clinic staff can view all clinics"
  on public.clinics for select
  using (public.current_user_is_clinic_staff());

create policy "Clinic staff can view profiles in any clinic"
  on public.profiles for select
  using (public.current_user_is_clinic_staff());

create policy "Clinic staff can view patients in any clinic"
  on public.patients for select
  using (public.current_user_is_clinic_staff());

create policy "Clinic staff can view appointments in any clinic"
  on public.appointments for select
  using (public.current_user_is_clinic_staff());

create policy "Clinic staff can view patient notes in any clinic"
  on public.patient_notes for select
  using (public.current_user_is_clinic_staff());

create policy "Clinic staff can view tooth records in any clinic"
  on public.tooth_records for select
  using (public.current_user_is_clinic_staff());

create policy "Clinic staff can view patient branch tags in any clinic"
  on public.patient_branch_tags for select
  using (public.current_user_is_clinic_staff());

create policy "Clinic staff can view dental chart photos in any clinic"
  on public.dental_chart_photos for select
  using (public.current_user_is_clinic_staff());

create policy "Clinic staff can view patient medical history in any clinic"
  on public.patient_medical_history for select
  using (public.current_user_is_clinic_staff());

create policy "Clinic staff can view patient consent forms in any clinic"
  on public.patient_consent_forms for select
  using (public.current_user_is_clinic_staff());

create policy "Clinic staff can view treatment records in any clinic"
  on public.treatment_records for select
  using (public.current_user_is_clinic_staff());

-- Storage: signed URLs for another clinic's patient/chart photos must
-- resolve for a viewing (not just uploading/deleting) clinic-staff member.
-- Upload/delete stay clinic-pinned — only the SELECT policies change.
alter policy "Clinic staff can read patient photos in their clinic"
  on storage.objects
  using (
    bucket_id = 'patient-photos'
    and (
      public.current_user_role() = 'superadmin'
      or public.current_user_is_clinic_staff()
      or (storage.foldername(name))[1] = public.current_user_clinic_id()::text
    )
  );

alter policy "Clinic staff can read dental chart photos in their clinic"
  on storage.objects
  using (
    bucket_id = 'dental-chart-photos'
    and (
      public.current_user_role() = 'superadmin'
      or public.current_user_is_clinic_staff()
      or (storage.foldername(name))[1] = public.current_user_clinic_id()::text
    )
  );
