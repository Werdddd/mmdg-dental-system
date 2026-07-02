// Fixed question/condition set for the Medical History Questionnaire.
// This is the single source of truth for both rendering the form and the
// shape of the JSONB columns on patient_medical_history
// (0014_patient_intake_expansion.sql) — general_responses/
// additional_responses/women_only_responses are keyed by the `key` below
// with { answer: boolean | null, remarks: string }, and conditions is keyed
// by each condition's `key` with { checked: boolean, remarks: string }.

export interface QuestionDef {
  key: string
  label: string
}

export const GENERAL_QUESTIONS: QuestionDef[] = [
  {
    key: 'painOrDiscomfort',
    label: 'Are you having pain or discomfort at this time?',
  },
  {
    key: 'nervousAboutTreatment',
    label: 'Do you feel nervous about having dental treatment?',
  },
  {
    key: 'badDentalExperience',
    label: 'Have you had a bad experience in a dental clinic?',
  },
  {
    key: 'hospitalizedLast2Years',
    label: 'Have you been hospitalized within the last 2 years?',
  },
  { key: 'underMedicalCare', label: 'Are you currently under medical care?' },
  {
    key: 'medicationsLast2Years',
    label: 'Have you taken medications within the last 2 years?',
  },
  {
    key: 'hasAllergies',
    label:
      'Do you have any allergies to medications, food, or environmental factors?',
  },
  {
    key: 'excessiveBleedingHistory',
    label: 'Have you experienced excessive bleeding requiring treatment?',
  },
]

export interface ConditionCategory {
  category: string
  conditions: QuestionDef[]
}

export const MEDICAL_CONDITION_CATEGORIES: ConditionCategory[] = [
  {
    category: 'Cardiovascular',
    conditions: [
      { key: 'heartFailure', label: 'Heart Failure' },
      { key: 'heartDiseaseAttack', label: 'Heart Disease / Heart Attack' },
      { key: 'anginaPectoris', label: 'Angina Pectoris' },
      { key: 'highBloodPressure', label: 'High Blood Pressure' },
      { key: 'heartMurmur', label: 'Heart Murmur' },
      { key: 'congenitalHeartDisease', label: 'Congenital Heart Disease' },
      { key: 'artificialHeartValve', label: 'Artificial Heart Valve' },
      { key: 'heartPacemaker', label: 'Heart Pacemaker' },
      { key: 'stroke', label: 'Stroke' },
    ],
  },
  {
    category: 'Respiratory',
    conditions: [
      { key: 'asthma', label: 'Asthma' },
      { key: 'emphysema', label: 'Emphysema' },
      { key: 'tuberculosis', label: 'Tuberculosis (TB)' },
      { key: 'chronicCough', label: 'Chronic Cough' },
      { key: 'hayFever', label: 'Hay Fever' },
      { key: 'sinusProblems', label: 'Sinus Problems' },
      { key: 'shortnessOfBreath', label: 'Shortness of Breath' },
    ],
  },
  {
    category: 'Blood Disorders',
    conditions: [
      { key: 'anemia', label: 'Anemia' },
      { key: 'hemophilia', label: 'Hemophilia' },
      { key: 'bloodTransfusionHistory', label: 'Blood Transfusion History' },
    ],
  },
  {
    category: 'Endocrine / Metabolic',
    conditions: [{ key: 'diabetes', label: 'Diabetes' }],
  },
  {
    category: 'Infectious Diseases',
    conditions: [
      { key: 'hepatitisA', label: 'Hepatitis A' },
      { key: 'hepatitisB', label: 'Hepatitis B' },
      { key: 'aidsHiv', label: 'AIDS / HIV' },
      { key: 'venerealDisease', label: 'Venereal Disease' },
    ],
  },
  {
    category: 'Neurological',
    conditions: [
      { key: 'epilepsySeizures', label: 'Epilepsy or Seizures' },
      { key: 'faintingDizzySpells', label: 'Fainting or Dizzy Spells' },
    ],
  },
  {
    category: 'Musculoskeletal',
    conditions: [
      { key: 'arthritis', label: 'Arthritis' },
      { key: 'rheumatism', label: 'Rheumatism' },
      { key: 'artificialJoint', label: 'Artificial Joint' },
    ],
  },
  {
    category: 'Cancer / Treatment History',
    conditions: [
      { key: 'chemotherapy', label: 'Chemotherapy' },
      { key: 'radiationTherapy', label: 'Radiation Therapy' },
      { key: 'cancerTumorHistory', label: 'Cancer / Tumor History' },
    ],
  },
  {
    category: 'Other Conditions',
    conditions: [
      { key: 'liverDisease', label: 'Liver Disease' },
      { key: 'drugAddiction', label: 'Drug Addiction' },
      { key: 'nervousness', label: 'Nervousness' },
      { key: 'coldSores', label: 'Cold Sores' },
      { key: 'otherMedicalConditions', label: 'Other Medical Conditions' },
    ],
  },
]

export const ADDITIONAL_QUESTIONS: QuestionDef[] = [
  {
    key: 'unlistedDiseaseOrCondition',
    label: 'Do you have any disease, condition, or problem not listed above?',
  },
  {
    key: 'chestPainOnExertion',
    label:
      'Do you experience chest pain or shortness of breath during physical activity?',
  },
  { key: 'ankleSwelling', label: 'Do your ankles swell during the day?' },
  {
    key: 'wakeShortOfBreath',
    label: 'Do you wake up due to shortness of breath?',
  },
  { key: 'onSpecialDiet', label: 'Are you on a special diet?' },
  {
    key: 'toldHasCancerOrTumor',
    label: 'Has a doctor ever told you that you have cancer or a tumor?',
  },
]

export const WOMEN_ONLY_QUESTIONS: QuestionDef[] = [
  { key: 'pregnant', label: 'Are you pregnant?' },
  { key: 'practicingBirthControl', label: 'Are you practicing birth control?' },
  {
    key: 'anticipatingPregnancy',
    label: 'Do you anticipate becoming pregnant?',
  },
]

export interface QuestionResponse {
  answer: boolean | null
  remarks: string
}

export type QuestionnaireResponses = Record<string, QuestionResponse>

export interface ConditionResponse {
  checked: boolean
  remarks: string
}

export type ConditionResponses = Record<string, ConditionResponse>

export const EMPTY_QUESTION_RESPONSE: QuestionResponse = {
  answer: null,
  remarks: '',
}

export const EMPTY_CONDITION_RESPONSE: ConditionResponse = {
  checked: false,
  remarks: '',
}
