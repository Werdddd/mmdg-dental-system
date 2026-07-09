-- Force a password change on first login for admin-provisioned accounts.
-- Every account is created with a predictable default password (see
-- src/lib/auth/default-password.ts: FirstnameLastname + current year), so
-- this flag is set true at creation time and cleared once the user sets
-- their own password via /change-password.

alter table public.profiles
  add column must_change_password boolean not null default false;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, clinic_id, must_change_password)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'dentist'),
    (new.raw_user_meta_data ->> 'clinic_id')::uuid,
    coalesce((new.raw_user_meta_data ->> 'must_change_password')::boolean, false)
  );
  return new;
end;
$$;
