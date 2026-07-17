-- Patient acknowledgment signature captured when a payment is recorded,
-- confirming the treatment(s) billed on that invoice were received. Nullable
-- at the DB level (existing payments predate this feature) even though the
-- app requires it for every new payment going forward.
alter table public.payments
  add column signature_type text check (signature_type in ('drawn', 'typed')),
  add column signature_data text,
  add column signature_printed_name text;
