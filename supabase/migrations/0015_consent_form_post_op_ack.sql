-- Second acknowledgement on the Consent & Waiver form: "I have read and
-- understood post-op instructions given to me," signed separately by the
-- patient below the Guardian block.

alter table public.patient_consent_forms
  add column post_op_ack_signature_type text check (post_op_ack_signature_type in ('drawn', 'typed')),
  add column post_op_ack_signature_data text,
  add column post_op_ack_printed_name text,
  add column post_op_ack_signed_date date;
