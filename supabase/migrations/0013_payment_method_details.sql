-- Trim payment methods to what the clinic actually accepts, and let Bank/
-- GCash payments carry proof: Bank gets a bank name + reference number,
-- GCash gets a reference number, and either can attach a screenshot/photo.
-- All of these are optional.

update public.payments set method = 'Cash' where method in ('Card', 'Maya');

alter table public.payments alter column method type text;
drop type public.payment_method;
create type public.payment_method as enum ('Cash', 'Bank', 'GCash', 'Sponsored', 'Pro Bono');
alter table public.payments
  alter column method type public.payment_method using method::public.payment_method;

alter table public.payments
  add column bank_name text,
  add column reference_number text,
  add column proof_photo_path text;

-- Private storage bucket for payment proof screenshots, same clinic-scoped
-- folder convention (`{clinic_id}/{filename}`) as dental-chart-photos.
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

create policy "Clinic staff can read payment proofs in their clinic"
  on storage.objects for select
  using (
    bucket_id = 'payment-proofs'
    and (
      public.current_user_role() = 'superadmin'
      or (storage.foldername(name))[1] = public.current_user_clinic_id()::text
    )
  );

create policy "Clinic staff can upload payment proofs in their clinic"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-proofs'
    and (
      public.current_user_role() = 'superadmin'
      or (storage.foldername(name))[1] = public.current_user_clinic_id()::text
    )
  );

create policy "Clinic staff can delete payment proofs in their clinic"
  on storage.objects for delete
  using (
    bucket_id = 'payment-proofs'
    and (
      public.current_user_role() = 'superadmin'
      or (storage.foldername(name))[1] = public.current_user_clinic_id()::text
    )
  );
