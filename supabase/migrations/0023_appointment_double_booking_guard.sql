-- Prevent double-booking: two appointments for the same dentist at the same
-- exact date/time. The app checks for a conflict before inserting (for a
-- friendly error message), but only a DB constraint closes the race between
-- two concurrent bookings for the same slot.
--
-- Cancelled/No Show/Rescheduled appointments have freed up their slot, so
-- they're excluded from the uniqueness check.

create unique index appointments_dentist_slot_unique
  on public.appointments (dentist_id, scheduled_at)
  where status not in ('Cancelled', 'No Show', 'Rescheduled');
