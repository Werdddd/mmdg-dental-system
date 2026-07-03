-- Global document library: flat folders + files, shared across all clinics
-- (unlike patients/appointments, which are clinic-scoped). SuperAdmin/Admin
-- manage folders and uploads; all other staff roles get read-only access.

create table public.document_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid not null references public.document_folders (id) on delete cascade,
  name text not null,
  file_path text not null,
  file_type text not null,
  file_size bigint not null,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index documents_folder_id_idx on public.documents (folder_id);

alter table public.document_folders enable row level security;
alter table public.documents enable row level security;

create policy "Staff can read document folders"
  on public.document_folders for select
  using (
    public.current_user_role() in
      ('superadmin', 'admin', 'dentist', 'receptionist', 'dental_assistant')
  );

create policy "Staff can read documents"
  on public.documents for select
  using (
    public.current_user_role() in
      ('superadmin', 'admin', 'dentist', 'receptionist', 'dental_assistant')
  );

create policy "Admins can manage document folders"
  on public.document_folders for all
  using (public.current_user_role() in ('superadmin', 'admin'))
  with check (public.current_user_role() in ('superadmin', 'admin'));

create policy "Admins can manage documents"
  on public.documents for all
  using (public.current_user_role() in ('superadmin', 'admin'))
  with check (public.current_user_role() in ('superadmin', 'admin'));

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Staff can read document files"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and public.current_user_role() in
      ('superadmin', 'admin', 'dentist', 'receptionist', 'dental_assistant')
  );

create policy "Admins can upload document files"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and public.current_user_role() in ('superadmin', 'admin')
  );

create policy "Admins can delete document files"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and public.current_user_role() in ('superadmin', 'admin')
  );
