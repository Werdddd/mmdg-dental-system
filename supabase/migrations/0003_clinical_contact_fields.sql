-- Contact/display fields needed to wire the Patients/Appointments/Payments/
-- Invoices pages to real data. All 4 clinical tables are still empty in
-- every environment, so no backfill is required anywhere below.

-- patients.phone — every nested `patient: {name, initials, phone}` object
-- rendered across Appointment/Payment/Invoice rows needs it.
alter table public.patients
  add column phone text;

-- profiles.specialty — dentist-only in practice (like clinic_id is
-- superadmin-null in practice), but advisory/display-only, so no check
-- constraint enforcing the role pairing.
alter table public.profiles
  add column specialty text;

-- payments: treatment + dentist are collected directly on the Add Payment
-- form, independent of any invoice/appointment join, so they're stored
-- directly rather than derived through a fragile invoice->appointment->
-- dentist chain. invoice_id becomes nullable since linking a payment to a
-- real invoice is out of scope for this pass.
alter table public.payments
  alter column invoice_id drop not null,
  add column treatment text not null,
  add column dentist_id uuid references public.profiles (id) on delete set null;

create index payments_dentist_id_idx on public.payments (dentist_id);

-- Human-friendly sequential display codes. invoices-table.tsx and
-- payments-table.tsx render `.id` directly as the first, bolded column —
-- a raw UUID would look wrong there. DB stores the integer; the app
-- formats "INV-{n}" / "PAY-{n}" for display. (patients/appointments don't
-- need this — their `.id` is never rendered as visible text.)
alter table public.invoices
  add column invoice_number bigserial unique;

alter table public.payments
  add column payment_number bigserial unique;
