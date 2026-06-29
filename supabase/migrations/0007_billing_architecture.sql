-- Scalable billing & payment architecture.
--
-- Lifecycle: Patient -> Appointment -> Treatment/Dental-Chart Record ->
-- Invoice -> Payment(s). Treatment records are the missing link: a billable
-- unit of clinical work (tooth-specific or general) with a cost, logged
-- *before* it is ever invoiced. Invoices are built from one or more
-- treatment records (invoice_items), and payments (cash, digital wallet,
-- bank, card, sponsored, or pro bono) are recorded only against an existing
-- invoice. Balances and statuses are never hand-entered — a trigger
-- recomputes them from invoice_items/payments on every change.
--
-- All four clinical tables (patients/appointments/invoices/payments) are
-- still empty in every environment, so enums below are recreated rather than
-- patched, and breaking column changes need no backfill.

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------

create type public.patient_type as enum ('Regular', 'Sponsored', 'Pro Bono');
create type public.treatment_record_status as enum ('Pending', 'Invoiced', 'Void');

-- payment_method gains Sponsored/Pro Bono; payment_status drops
-- Partially Paid/Unpaid (those are invoice-level states, not per-payment).
-- Recreated from scratch since the table is empty in every environment.
alter table public.payments alter column method type text;
drop type public.payment_method;
create type public.payment_method as enum (
  'Cash', 'Card', 'Bank', 'GCash', 'Maya', 'Sponsored', 'Pro Bono'
);
alter table public.payments
  alter column method type public.payment_method using method::public.payment_method;

alter table public.payments alter column status drop default;
alter table public.payments alter column status type text;
drop type public.payment_status;
create type public.payment_status as enum ('Paid', 'Refunded');
alter table public.payments
  alter column status type public.payment_status using status::public.payment_status,
  alter column status set default 'Paid';

-- ---------------------------------------------------------------------
-- Patients: Regular / Sponsored / Pro Bono
-- ---------------------------------------------------------------------

alter table public.patients
  add column patient_type public.patient_type not null default 'Regular';

-- ---------------------------------------------------------------------
-- Sponsors & per-patient coverage
-- ---------------------------------------------------------------------

create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  name text not null,
  contact_person text,
  phone text,
  email text,
  default_coverage_percentage numeric(5, 2) not null default 100
    check (default_coverage_percentage between 0 and 100),
  notes text,
  created_at timestamptz not null default now()
);

create table public.patient_sponsorships (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  sponsor_id uuid not null references public.sponsors (id) on delete cascade,
  coverage_percentage numeric(5, 2) not null
    check (coverage_percentage between 0 and 100),
  coverage_cap numeric(10, 2),
  valid_from date not null default current_date,
  valid_to date,
  notes text,
  created_at timestamptz not null default now()
);

-- A patient has at most one open-ended ("current") sponsorship; closing one
-- out (set valid_to) frees the patient up for a new one while preserving
-- history.
create unique index patient_sponsorships_one_active_idx
  on public.patient_sponsorships (patient_id)
  where valid_to is null;

create index sponsors_clinic_id_idx on public.sponsors (clinic_id);
create index patient_sponsorships_clinic_id_idx on public.patient_sponsorships (clinic_id);
create index patient_sponsorships_patient_id_idx on public.patient_sponsorships (patient_id);
create index patient_sponsorships_sponsor_id_idx on public.patient_sponsorships (sponsor_id);

-- ---------------------------------------------------------------------
-- Treatment records: the billable clinical ledger
-- ---------------------------------------------------------------------

create table public.treatment_records (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  appointment_id uuid references public.appointments (id) on delete set null,
  tooth_record_id uuid references public.tooth_records (id) on delete set null,
  tooth smallint check (tooth between 1 and 32),
  branch public.clinic_branch,
  treatment text not null,
  dentist_id uuid references public.profiles (id) on delete set null,
  cost numeric(10, 2) not null default 0 check (cost >= 0),
  status public.treatment_record_status not null default 'Pending',
  performed_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create index treatment_records_clinic_id_idx on public.treatment_records (clinic_id);
create index treatment_records_patient_id_idx on public.treatment_records (patient_id);
create index treatment_records_status_idx on public.treatment_records (status);

-- ---------------------------------------------------------------------
-- Invoices: drop the single free-text treatment; items now carry it
-- ---------------------------------------------------------------------

alter table public.invoices drop column treatment;

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  -- restrict (not cascade): a billed treatment record can't be deleted out
  -- from under a financial record. unique: a treatment can only be billed
  -- once, ever — the DB-level guarantee against double-invoicing.
  treatment_record_id uuid not null unique
    references public.treatment_records (id) on delete restrict,
  description text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  amount numeric(10, 2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

create index invoice_items_clinic_id_idx on public.invoice_items (clinic_id);
create index invoice_items_invoice_id_idx on public.invoice_items (invoice_id);

-- ---------------------------------------------------------------------
-- Payments: must reference a real invoice; coverage is just another method
-- ---------------------------------------------------------------------

alter table public.payments
  alter column invoice_id set not null,
  drop column treatment,
  drop column dentist_id,
  add column sponsor_id uuid references public.sponsors (id) on delete set null;

alter table public.payments
  add constraint payments_sponsor_method_check check (
    (method = 'Sponsored' and sponsor_id is not null)
    or (method <> 'Sponsored')
  );

create index payments_sponsor_id_idx on public.payments (sponsor_id);

-- ---------------------------------------------------------------------
-- Automatic balance/status engine
-- ---------------------------------------------------------------------

create function public.recalculate_invoice_totals(p_invoice_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subtotal numeric(10, 2);
  v_tax numeric(10, 2);
  v_total numeric(10, 2);
  v_paid numeric(10, 2);
  v_balance numeric(10, 2);
  v_due_date date;
  v_status public.invoice_status;
begin
  select coalesce(sum(amount), 0) into v_subtotal
  from public.invoice_items
  where invoice_id = p_invoice_id;

  -- 12% tax rate — mirrors TAX_RATE in src/components/invoices/data.ts.
  v_tax := round(v_subtotal * 0.12, 2);
  v_total := v_subtotal + v_tax;

  select coalesce(sum(amount), 0) into v_paid
  from public.payments
  where invoice_id = p_invoice_id and status = 'Paid';

  v_balance := v_total - v_paid;

  select due_date into v_due_date from public.invoices where id = p_invoice_id;

  v_status := case
    when v_balance <= 0 then 'Paid'
    when v_due_date is not null and v_due_date < current_date then 'Overdue'
    when v_paid > 0 then 'Partially Paid'
    else 'Unpaid'
  end;

  update public.invoices
  set subtotal = v_subtotal,
      tax = v_tax,
      total = v_total,
      balance = v_balance,
      status = v_status
  where id = p_invoice_id;
end;
$$;

create function public.trg_invoice_items_recalculate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.treatment_records
    set status = 'Invoiced'
    where id = new.treatment_record_id;
    perform public.recalculate_invoice_totals(new.invoice_id);
  elsif tg_op = 'UPDATE' then
    perform public.recalculate_invoice_totals(new.invoice_id);
    if new.invoice_id <> old.invoice_id then
      perform public.recalculate_invoice_totals(old.invoice_id);
    end if;
  elsif tg_op = 'DELETE' then
    perform public.recalculate_invoice_totals(old.invoice_id);
  end if;
  return null;
end;
$$;

create trigger invoice_items_recalculate
  after insert or update or delete on public.invoice_items
  for each row execute function public.trg_invoice_items_recalculate();

create function public.trg_payments_recalculate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.recalculate_invoice_totals(new.invoice_id);
  elsif tg_op = 'UPDATE' then
    perform public.recalculate_invoice_totals(new.invoice_id);
    if new.invoice_id <> old.invoice_id then
      perform public.recalculate_invoice_totals(old.invoice_id);
    end if;
  elsif tg_op = 'DELETE' then
    perform public.recalculate_invoice_totals(old.invoice_id);
  end if;
  return null;
end;
$$;

create trigger payments_recalculate
  after insert or update or delete on public.payments
  for each row execute function public.trg_payments_recalculate();

-- Defense in depth beyond app-level validation: a payment can never be
-- zero/negative or overpay an invoice, even via a direct SQL/API call.
create function public.trg_payments_validate_amount()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric(10, 2);
begin
  if new.amount <= 0 then
    raise exception 'Payment amount must be greater than zero.';
  end if;

  select balance into v_balance from public.invoices where id = new.invoice_id;

  if v_balance is null then
    raise exception 'Invoice % not found.', new.invoice_id;
  end if;

  if new.amount > v_balance then
    raise exception 'Payment amount (%) exceeds the invoice balance (%).',
      new.amount, v_balance;
  end if;

  return new;
end;
$$;

create trigger payments_validate_amount
  before insert on public.payments
  for each row execute function public.trg_payments_validate_amount();

-- ---------------------------------------------------------------------
-- RLS — same clinic-scoped pattern as every other clinical table
-- ---------------------------------------------------------------------

alter table public.sponsors enable row level security;
alter table public.patient_sponsorships enable row level security;
alter table public.treatment_records enable row level security;
alter table public.invoice_items enable row level security;

create policy "Superadmins can manage all sponsors"
  on public.sponsors for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Clinic staff can manage sponsors in their clinic"
  on public.sponsors for all
  using (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  );

create policy "Superadmins can manage all patient sponsorships"
  on public.patient_sponsorships for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Clinic staff can manage patient sponsorships in their clinic"
  on public.patient_sponsorships for all
  using (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  );

create policy "Superadmins can manage all treatment records"
  on public.treatment_records for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Clinic staff can manage treatment records in their clinic"
  on public.treatment_records for all
  using (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  );

create policy "Superadmins can manage all invoice items"
  on public.invoice_items for all
  using (public.current_user_role() = 'superadmin')
  with check (public.current_user_role() = 'superadmin');

create policy "Clinic staff can manage invoice items in their clinic"
  on public.invoice_items for all
  using (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  )
  with check (
    public.current_user_role() in ('admin', 'dentist')
    and clinic_id = public.current_user_clinic_id()
  );
