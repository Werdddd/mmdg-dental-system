-- Adds a clinic address field (for the new /clinics detail page) and two new
-- staff roles — Receptionist and Dental Assistant — kept in their own
-- migration since a freshly added enum value can't be referenced by name in
-- the same transaction it was added in.

alter table public.clinics add column address text;

alter type public.user_role add value 'receptionist';
alter type public.user_role add value 'dental_assistant';
