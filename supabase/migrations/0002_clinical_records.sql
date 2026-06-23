-- Patients, appointments, invoices, and payments — clinic-scoped clinical
-- records. Builds on the clinics/profiles/RLS-helper foundation from
-- 0001_clinics_profiles_roles.sql.
--
-- Scoping: a patient belongs to exactly one clinic (same model as
-- profiles), and every other table here inherits that clinic via FK chain.
-- Admins and Dentists get equal read/write access within their own clinic;
-- SuperAdmins see everything.

create type public.patient_gender as enum ('Male', 'Female');
create type public.treatment_status as enum ('Active', 'Completed');
create type public.appointment_mode as enum ('In-person', 'Video Call', 'Phone Call');
create type public.appointment_status as enum ('Confirmed', 'Completed', 'Ongoing', 'Cancelled', 'Rescheduled');
create type public.invoice_status as enum ('Paid', 'Partially Paid', 'Overdue', 'Unpaid');
create type public.payment_method as enum ('Cash', 'Card', 'Bank', 'GCash', 'Maya');
create type public.payment_status as enum ('Paid', 'Partially Paid', 'Unpaid', 'Refunded');

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  full_name text not null,
  gender public.patient_gender,
  birthday date,
  address text,
  treatment_status public.treatment_status not null default 'Active',
  created_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  dentist_id uuid not null references public.profiles (id) on delete restrict,
  scheduled_at timestamptz not null,
  mode public.appointment_mode not null default 'In-person',
  status public.appointment_status not null default 'Confirmed',
  notes text,
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  appointment_id uuid references public.appointments (id) on delete set null,
  treatment text not null,
  due_date date,
  subtotal numeric(10, 2) not null default 0,
  tax numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  balance numeric(10, 2) not null default 0,
  status public.invoice_status not null default 'Unpaid',
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  method public.payment_method not null,
  amount numeric(10, 2) not null,
  status public.payment_status not null default 'Paid',
  paid_at timestamptz not null default now()
);

create index patients_clinic_id_idx on public.patients (clinic_id);
create index appointments_clinic_id_idx on public.appointments (clinic_id);
create index appointments_patient_id_idx on public.appointments (patient_id);
create index appointments_dentist_id_idx on public.appointments (dentist_id);
create index invoices_clinic_id_idx on public.invoices (clinic_id);
create index invoices_patient_id_idx on public.invoices (patient_id);
create index payments_clinic_id_idx on public.payments (clinic_id);
create index payments_invoice_id_idx on public.payments (invoice_id);

alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;

-- Patients policies
create policy "Superadmins can manage all patients"
  on public.patients for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Clinic staff can manage patients in their clinic"
  on public.patients for all
  using (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  );

-- Appointments policies
create policy "Superadmins can manage all appointments"
  on public.appointments for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Clinic staff can manage appointments in their clinic"
  on public.appointments for all
  using (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  );

-- Invoices policies
create policy "Superadmins can manage all invoices"
  on public.invoices for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Clinic staff can manage invoices in their clinic"
  on public.invoices for all
  using (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  );

-- Payments policies
create policy "Superadmins can manage all payments"
  on public.payments for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Clinic staff can manage payments in their clinic"
  on public.payments for all
  using (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  );
