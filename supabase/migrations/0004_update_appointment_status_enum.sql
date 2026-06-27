-- Replace the old appointment_status enum (Confirmed/Ongoing/Completed/Cancelled/Rescheduled)
-- with the new clinical state-machine values.
--
-- Mapping applied to existing rows:
--   Confirmed   → Scheduled
--   Ongoing     → In Progress
--   Completed   → Completed   (unchanged)
--   Cancelled   → Cancelled   (unchanged)
--   Rescheduled → Rescheduled (unchanged)

-- 1. Rename old type so we can create the new one with the same name.
alter type public.appointment_status rename to appointment_status_old;

-- 2. Create the new enum.
create type public.appointment_status as enum (
  'Scheduled',
  'In Progress',
  'Completed',
  'Cancelled',
  'No Show',
  'Rescheduled'
);

-- 3. Migrate the column — drop default first, retype with USING, restore default.
alter table public.appointments
  alter column status drop default;

alter table public.appointments
  alter column status type public.appointment_status
  using case status::text
    when 'Confirmed'   then 'Scheduled'::public.appointment_status
    when 'Ongoing'     then 'In Progress'::public.appointment_status
    when 'Completed'   then 'Completed'::public.appointment_status
    when 'Cancelled'   then 'Cancelled'::public.appointment_status
    when 'Rescheduled' then 'Rescheduled'::public.appointment_status
    else                    'Scheduled'::public.appointment_status
  end;

alter table public.appointments
  alter column status set default 'Scheduled';

-- 4. Drop the old enum.
drop type public.appointment_status_old;
