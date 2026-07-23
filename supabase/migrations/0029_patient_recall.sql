-- Lets staff flag a date to follow up with a patient about booking their
-- next visit (e.g. after a payment), independent of an actual scheduled
-- appointment.
alter table public.patients
  add column recall_date date,
  add column recall_note text;
