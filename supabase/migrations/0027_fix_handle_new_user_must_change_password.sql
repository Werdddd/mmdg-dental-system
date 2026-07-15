-- 0026's rewrite of handle_new_user() (for clinic_staff provisioning)
-- accidentally dropped the must_change_password carry-through that
-- 0021_force_password_change.sql had added, so newly created staff no
-- longer got flagged to change their default password on first login.
-- Restore it alongside the clinic_staff insert.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_clinic_id uuid;
begin
  insert into public.profiles (id, full_name, role, must_change_password)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'dentist'),
    coalesce((new.raw_user_meta_data ->> 'must_change_password')::boolean, false)
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
