-- Drop the unused Internal Clinic Remarks field, and add an optional
-- patient profile photo (uploaded or captured on the intake form),
-- following the same private-bucket-per-clinic-folder pattern as
-- dental-chart-photos (0006_dental_chart_branches_photos.sql).

alter table public.patients
  drop column internal_remarks;

alter table public.patients
  add column photo_path text;

insert into storage.buckets (id, name, public)
values ('patient-photos', 'patient-photos', false)
on conflict (id) do nothing;

create policy "Clinic staff can read patient photos in their clinic"
  on storage.objects for select
  using (
    bucket_id = 'patient-photos'
    and (
      public.current_user_role() = 'superadmin'
      or (storage.foldername(name))[1] = public.current_user_clinic_id()::text
    )
  );

create policy "Clinic staff can upload patient photos in their clinic"
  on storage.objects for insert
  with check (
    bucket_id = 'patient-photos'
    and (
      public.current_user_role() = 'superadmin'
      or (storage.foldername(name))[1] = public.current_user_clinic_id()::text
    )
  );

create policy "Clinic staff can delete patient photos in their clinic"
  on storage.objects for delete
  using (
    bucket_id = 'patient-photos'
    and (
      public.current_user_role() = 'superadmin'
      or (storage.foldername(name))[1] = public.current_user_clinic_id()::text
    )
  );
