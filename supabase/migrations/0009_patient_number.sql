-- Human-friendly sequential patient identifier — same convention as
-- invoice_number/payment_number from 0003_clinical_contact_fields.sql.
-- The DB stores the integer; the app formats "P-{6-digit}" for display
-- (search bar, patient grid, patient detail header). bigserial is one
-- sequence shared by every clinic, so the number — and therefore the
-- formatted code — can never collide across clinics.
alter table public.patients
  add column patient_number bigserial unique not null;
