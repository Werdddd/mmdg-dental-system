-- Fix a payment race condition: two payments submitted for the same invoice
-- within the same window could both read the pre-payment balance, both pass
-- validation, and both insert — overpaying the invoice while the recompute
-- trigger silently marks it "Paid" with a hidden negative balance.
--
-- `select ... for update` takes a row lock on the invoice, so a second
-- concurrent insert's validation blocks until the first payment's
-- transaction (insert + balance recompute) commits, then re-reads the
-- now-updated balance instead of a stale one.

create or replace function public.trg_payments_validate_amount()
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

  select balance into v_balance
  from public.invoices
  where id = new.invoice_id
  for update;

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
