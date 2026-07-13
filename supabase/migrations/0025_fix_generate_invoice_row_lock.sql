-- 0024's generate_invoice fails on every call: `select count(*) ... for
-- update` is rejected by Postgres outright ("FOR UPDATE is not allowed with
-- aggregate functions"), so no invoice has ever been generated successfully.
--
-- Fix: lock the candidate rows in a subquery, then count them in the outer
-- aggregate — same locking behavior, valid syntax.

create or replace function public.generate_invoice(
  p_clinic_id uuid,
  p_patient_id uuid,
  p_treatment_record_ids uuid[],
  p_due_date date
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

  insert into public.invoices (clinic_id, patient_id, due_date)
  values (p_clinic_id, p_patient_id, p_due_date)
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
