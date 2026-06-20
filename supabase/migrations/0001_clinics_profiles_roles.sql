-- Clinics, profiles, and role-based access for the MMDG dental system.
--
-- Accounts are provisioned by an Admin or SuperAdmin (no public signup), via
-- the Supabase Admin API `createUser` call with `role` / `clinic_id` /
-- `full_name` set in `user_metadata`. The trigger below copies that metadata
-- into a `profiles` row when the auth user is created.

create extension if not exists pgcrypto;

create type public.user_role as enum ('superadmin', 'admin', 'dentist');

create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.user_role not null default 'dentist',
  clinic_id uuid references public.clinics (id) on delete set null,
  created_at timestamptz not null default now(),
  -- SuperAdmins are not scoped to a clinic; Admins and Dentists must be.
  constraint profiles_role_clinic_check check (
    (role = 'superadmin' and clinic_id is null)
    or (role in ('admin', 'dentist') and clinic_id is not null)
  )
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, clinic_id)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'dentist'),
    (new.raw_user_meta_data ->> 'clinic_id')::uuid
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.clinics enable row level security;
alter table public.profiles enable row level security;

-- SECURITY DEFINER helpers so RLS policies on `profiles` don't recursively
-- query `profiles` (which would otherwise re-trigger the same policy).
create function public.current_user_role()
returns public.user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.current_user_clinic_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select clinic_id from public.profiles where id = auth.uid();
$$;

-- Profiles policies
create policy "Users can read their own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Superadmins can read all profiles"
  on public.profiles for select
  using (public.current_user_role() = 'superadmin');

create policy "Admins can read profiles in their clinic"
  on public.profiles for select
  using (
    public.current_user_role() = 'admin'
    and clinic_id = public.current_user_clinic_id()
  );

create policy "Superadmins can manage all profiles"
  on public.profiles for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Admins can update profiles in their clinic"
  on public.profiles for update
  using (
    public.current_user_role() = 'admin'
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_role() = 'admin'
    and clinic_id = public.current_user_clinic_id()
  );

-- Clinics policies
create policy "Superadmins can manage clinics"
  on public.clinics for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Admins and dentists can read their own clinic"
  on public.clinics for select
  using (id = public.current_user_clinic_id());
