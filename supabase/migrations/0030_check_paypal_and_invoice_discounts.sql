-- Two independent additions:
--
-- 1. Payment methods gain Check and PayPal, alongside the existing
--    Cash/Bank/GCash/Sponsored/Pro Bono set.
--
-- 2. Invoices can now carry a discount applied at generation time: either
--    the fixed 20% PWD/Senior Citizen statutory discount, or a Special
--    Discount with a staff-entered percentage. recalculate_invoice_totals
--    deducts it from the subtotal before computing total/balance.

alter table public.payments alter column method type text;
drop type public.payment_method;
create type public.payment_method as enum (
  'Cash', 'Bank', 'GCash', 'Check', 'PayPal', 'Sponsored', 'Pro Bono'
);
alter table public.payments
  alter column method type public.payment_method using method::public.payment_method;

create type public.invoice_discount_type as enum (
  'None', 'PWD/Senior Citizen', 'Special Discount'
);

alter table public.invoices
  add column discount_type public.invoice_discount_type not null default 'None',
  add column discount_percentage numeric(5, 2) not null default 0
    check (discount_percentage between 0 and 100),
  add column discount_amount numeric(10, 2) not null default 0;

alter table public.invoices
  add constraint invoices_discount_type_percentage_check check (
    (discount_type = 'None' and discount_percentage = 0)
    or (discount_type = 'PWD/Senior Citizen' and discount_percentage = 20)
    or (discount_type = 'Special Discount')
  );

create or replace function public.recalculate_invoice_totals(p_invoice_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subtotal numeric(10, 2);
  v_discount_percentage numeric(5, 2);
  v_discount_amount numeric(10, 2);
  v_total numeric(10, 2);
  v_paid numeric(10, 2);
  v_balance numeric(10, 2);
  v_due_date date;
  v_status public.invoice_status;
begin
  select coalesce(sum(amount), 0) into v_subtotal
  from public.invoice_items
  where invoice_id = p_invoice_id;

  select discount_percentage, due_date into v_discount_percentage, v_due_date
  from public.invoices
  where id = p_invoice_id;

  v_discount_amount := round(v_subtotal * coalesce(v_discount_percentage, 0) / 100, 2);
  v_total := v_subtotal - v_discount_amount;

  select coalesce(sum(amount), 0) into v_paid
  from public.payments
  where invoice_id = p_invoice_id and status = 'Paid';

  v_balance := v_total - v_paid;

  v_status := case
    when v_balance <= 0 then 'Paid'
    when v_due_date is not null and v_due_date < current_date then 'Overdue'
    when v_paid > 0 then 'Partially Paid'
    else 'Unpaid'
  end;

  update public.invoices
  set subtotal = v_subtotal,
      discount_amount = v_discount_amount,
      total = v_total,
      balance = v_balance,
      status = v_status
  where id = p_invoice_id;
end;
$$;

create or replace function public.generate_invoice(
  p_clinic_id uuid,
  p_patient_id uuid,
  p_treatment_record_ids uuid[],
  p_due_date date,
  p_discount_type public.invoice_discount_type default 'None',
  p_discount_percentage numeric default 0
)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_invoice_id uuid;
  v_available_count int;
begin
  if p_treatment_record_ids is null or array_length(p_treatment_record_ids, 1) is null then
    raise exception 'Select at least one treatment to invoice.';
  end if;

  if p_discount_percentage < 0 or p_discount_percentage > 100 then
    raise exception 'Discount percentage must be between 0 and 100.';
  end if;
  if p_discount_type = 'None' and p_discount_percentage <> 0 then
    raise exception 'Discount percentage must be zero when no discount is applied.';
  end if;
  if p_discount_type = 'PWD/Senior Citizen' and p_discount_percentage <> 20 then
    raise exception 'PWD/Senior Citizen discount must be exactly 20%%.';
  end if;

  select count(*) into v_available_count
  from (
    select id
    from public.treatment_records
    where clinic_id = p_clinic_id
      and patient_id = p_patient_id
      and status = 'Pending'
      and id = any (p_treatment_record_ids)
    for update
  ) locked_rows;

  if v_available_count <> array_length(p_treatment_record_ids, 1) then
    raise exception 'One or more selected treatments are no longer available to invoice.';
  end if;

  insert into public.invoices (
    clinic_id, patient_id, due_date, discount_type, discount_percentage
  )
  values (
    p_clinic_id, p_patient_id, p_due_date, p_discount_type, p_discount_percentage
  )
  returning id into v_invoice_id;

  insert into public.invoice_items (
    clinic_id, invoice_id, treatment_record_id, description, quantity, unit_price, amount
  )
  select p_clinic_id, v_invoice_id, tr.id, tr.treatment, 1, tr.cost, tr.cost
  from public.treatment_records tr
  where tr.id = any (p_treatment_record_ids);

  return v_invoice_id;
end;
$$;
