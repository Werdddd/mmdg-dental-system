-- This clinic doesn't charge tax on invoices — drop the column and stop
-- computing it. Total is now just the subtotal of invoice_items.

create or replace function public.recalculate_invoice_totals(p_invoice_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subtotal numeric(10, 2);
  v_total numeric(10, 2);
  v_paid numeric(10, 2);
  v_balance numeric(10, 2);
  v_due_date date;
  v_status public.invoice_status;
begin
  select coalesce(sum(amount), 0) into v_subtotal
  from public.invoice_items
  where invoice_id = p_invoice_id;

  v_total := v_subtotal;

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
      total = v_total,
      balance = v_balance,
      status = v_status
  where id = p_invoice_id;
end;
$$;

alter table public.invoices drop column tax;
