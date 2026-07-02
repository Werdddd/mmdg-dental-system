-- Sponsorship/pro-bono is a per-payment decision (payments.method already
-- covers 'Sponsored' / 'Pro Bono'), never a standing attribute of a patient
-- or an external org. Drop the sponsor/patient_sponsorships tables and the
-- patient-level patient_type/sponsor_amount columns they were built around.

alter table public.payments drop constraint payments_sponsor_method_check;
alter table public.payments drop column sponsor_id;

drop table public.patient_sponsorships;
drop table public.sponsors;

alter table public.patients drop column patient_type;
drop type public.patient_type;
