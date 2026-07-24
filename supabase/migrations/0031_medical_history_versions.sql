-- Lets a clinic re-file a patient's medical history questionnaire any time
-- (health changes, periodic re-intake) without destroying prior answers:
-- patient_medical_history moves from one row per patient to one row per
-- filing, ordered by created_at.

alter table public.patient_medical_history
  drop constraint patient_medical_history_patient_id_key;

create index patient_medical_history_patient_id_created_at_idx
  on public.patient_medical_history (patient_id, created_at desc);
