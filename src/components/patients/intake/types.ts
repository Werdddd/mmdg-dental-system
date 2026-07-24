import {
  isMinor,
  type PatientRow,
  type PreferredContactMethod,
  type RecordStatus,
} from '@/components/patients/data'
import type { NewPatientInput, UpdatePatientInput } from '@/lib/data/patients'
import type {
  ConditionResponses,
  QuestionnaireResponses,
} from '@/lib/dental/medical-history-questions'
import type { SignatureValue } from '@/lib/dental/signature'
import {
  EMPTY_MEDICAL_HISTORY,
  type PatientMedicalHistoryRow,
} from '@/lib/data/patient-medical-history'
import {
  EMPTY_CONSENT_FORM,
  type PatientConsentFormRow,
} from '@/lib/data/patient-consent-forms'

export interface PatientIntakeFormValues {
  // Section 1: Patient Information
  photoFile: File | null
  photoRemoved: boolean
  firstName: string
  middleName: string
  lastName: string
  suffix: string
  birthday: string
  gender: PatientRow['gender']
  civilStatus: string
  nationality: string
  occupation: string
  address: string
  email: string
  phone: string
  telephoneNumber: string
  preferredContactMethod: PreferredContactMethod | ''
  emergencyContactName: string
  emergencyContactRelation: string
  emergencyContactPhone: string

  // Section 2: Dental Visit Information
  chiefComplaint: string
  historyOfPresentIllness: string
  initialClinicalFindings: string
  diagnosis: string
  treatmentRecommendations: string
  complaintRemarks: string

  // Section 3: Medical History Questionnaire
  generalResponses: QuestionnaireResponses
  additionalResponses: QuestionnaireResponses
  womenOnlyResponses: QuestionnaireResponses
  conditions: ConditionResponses
  medicalHistorySignature: SignatureValue | null
  medicalHistorySignedAt: string

  // Section 4: Consent & Waiver Form
  consentClinicName: string
  consentDentistName: string
  consentProceduresDescription: string
  consentDisposalClinicName: string
  consentPatientSignature: SignatureValue | null
  consentPatientPrintedName: string
  consentPatientSignedDate: string
  consentWitnessSignature: SignatureValue | null
  consentWitnessPrintedName: string
  consentWitnessSignedDate: string
  consentGuardianSignature: SignatureValue | null
  consentGuardianPrintedName: string
  consentGuardianSignedDate: string
  consentPostOpAckSignature: SignatureValue | null
  consentPostOpAckPrintedName: string
  consentPostOpAckSignedDate: string

  // Section 5: System Metadata
  recordStatus: RecordStatus
}

// The subset of intake values the Medical History Questionnaire section
// actually needs, so it can be reused outside the full intake wizard (e.g.
// a standalone "file a new questionnaire" dialog) without pulling in every
// other section's fields.
export type MedicalHistorySectionValues = Pick<
  PatientIntakeFormValues,
  | 'gender'
  | 'firstName'
  | 'lastName'
  | 'generalResponses'
  | 'additionalResponses'
  | 'womenOnlyResponses'
  | 'conditions'
  | 'medicalHistorySignature'
  | 'medicalHistorySignedAt'
>

export const EMPTY_PATIENT_INTAKE_FORM_VALUES: PatientIntakeFormValues = {
  photoFile: null,
  photoRemoved: false,
  firstName: '',
  middleName: '',
  lastName: '',
  suffix: '',
  birthday: '',
  gender: 'Female',
  civilStatus: '',
  nationality: '',
  occupation: '',
  address: '',
  email: '',
  phone: '',
  telephoneNumber: '',
  preferredContactMethod: '',
  emergencyContactName: '',
  emergencyContactRelation: '',
  emergencyContactPhone: '',

  chiefComplaint: '',
  historyOfPresentIllness: '',
  initialClinicalFindings: '',
  diagnosis: '',
  treatmentRecommendations: '',
  complaintRemarks: '',

  generalResponses: {},
  additionalResponses: {},
  womenOnlyResponses: {},
  conditions: {},
  medicalHistorySignature: null,
  medicalHistorySignedAt: '',

  consentClinicName: '',
  consentDentistName: '',
  consentProceduresDescription: '',
  consentDisposalClinicName: '',
  consentPatientSignature: null,
  consentPatientPrintedName: '',
  consentPatientSignedDate: '',
  consentWitnessSignature: null,
  consentWitnessPrintedName: '',
  consentWitnessSignedDate: '',
  consentGuardianSignature: null,
  consentGuardianPrintedName: '',
  consentGuardianSignedDate: '',
  consentPostOpAckSignature: null,
  consentPostOpAckPrintedName: '',
  consentPostOpAckSignedDate: '',

  recordStatus: 'Active',
}

export function patientToIntakeFormValues(
  patient: PatientRow,
  medicalHistory: PatientMedicalHistoryRow | null,
  consentForm: PatientConsentFormRow | null,
): PatientIntakeFormValues {
  const mh = medicalHistory ?? EMPTY_MEDICAL_HISTORY
  const cf = consentForm ?? EMPTY_CONSENT_FORM

  return {
    photoFile: null,
    photoRemoved: false,
    firstName: patient.firstName,
    middleName: patient.middleName,
    lastName: patient.lastName,
    suffix: patient.suffix,
    birthday: patient.birthdayIso,
    gender: patient.gender,
    civilStatus: patient.civilStatus,
    nationality: patient.nationality,
    occupation: patient.occupation,
    address: patient.address,
    email: patient.email,
    phone: patient.phone,
    telephoneNumber: patient.telephoneNumber,
    preferredContactMethod: patient.preferredContactMethod,
    emergencyContactName: patient.emergencyContact.name,
    emergencyContactRelation: patient.emergencyContact.relation,
    emergencyContactPhone: patient.emergencyContact.phone,

    chiefComplaint: patient.dentalVisit.chiefComplaint,
    historyOfPresentIllness: patient.dentalVisit.historyOfPresentIllness,
    initialClinicalFindings: patient.dentalVisit.initialClinicalFindings,
    diagnosis: patient.dentalVisit.diagnosis,
    treatmentRecommendations: patient.dentalVisit.treatmentRecommendations,
    complaintRemarks: patient.dentalVisit.remarks,

    generalResponses: mh.generalResponses,
    additionalResponses: mh.additionalResponses,
    womenOnlyResponses: mh.womenOnlyResponses,
    conditions: mh.conditions,
    medicalHistorySignature: mh.patientSignature,
    medicalHistorySignedAt: mh.signedAt,

    consentClinicName: cf.clinicName,
    consentDentistName: cf.dentistName,
    consentProceduresDescription: cf.proceduresDescription,
    consentDisposalClinicName: cf.disposalClinicName,
    consentPatientSignature: cf.patientSignature,
    consentPatientPrintedName: cf.patientPrintedName,
    consentPatientSignedDate: cf.patientSignedDate,
    consentWitnessSignature: cf.witnessSignature,
    consentWitnessPrintedName: cf.witnessPrintedName,
    consentWitnessSignedDate: cf.witnessSignedDate,
    consentGuardianSignature: cf.guardianSignature,
    consentGuardianPrintedName: cf.guardianPrintedName,
    consentGuardianSignedDate: cf.guardianSignedDate,
    consentPostOpAckSignature: cf.postOpAckSignature,
    consentPostOpAckPrintedName: cf.postOpAckPrintedName,
    consentPostOpAckSignedDate: cf.postOpAckSignedDate,

    recordStatus: patient.systemMetadata.recordStatus,
  }
}

export function intakeFormValuesToInput(
  values: PatientIntakeFormValues,
): NewPatientInput & UpdatePatientInput {
  return {
    firstName: values.firstName.trim(),
    middleName: values.middleName.trim(),
    lastName: values.lastName.trim(),
    suffix: values.suffix.trim(),
    gender: values.gender,
    birthday: values.birthday,
    civilStatus: values.civilStatus,
    nationality: values.nationality.trim(),
    occupation: values.occupation.trim(),
    address: values.address.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    telephoneNumber: values.telephoneNumber.trim(),
    preferredContactMethod: values.preferredContactMethod || undefined,
    emergencyContactName: values.emergencyContactName.trim(),
    emergencyContactRelation: values.emergencyContactRelation,
    emergencyContactPhone: values.emergencyContactPhone.trim(),

    chiefComplaint: values.chiefComplaint.trim(),
    historyOfPresentIllness: values.historyOfPresentIllness.trim(),
    initialClinicalFindings: values.initialClinicalFindings.trim(),
    diagnosis: values.diagnosis.trim(),
    treatmentRecommendations: values.treatmentRecommendations.trim(),
    complaintRemarks: values.complaintRemarks.trim(),

    recordStatus: values.recordStatus,

    medicalHistory: {
      generalResponses: values.generalResponses,
      additionalResponses: values.additionalResponses,
      womenOnlyResponses: values.womenOnlyResponses,
      conditions: values.conditions,
      patientSignature: values.medicalHistorySignature,
      signedAt: values.medicalHistorySignedAt,
    },

    consentForm: {
      clinicName: values.consentClinicName.trim(),
      dentistName: values.consentDentistName.trim(),
      proceduresDescription: values.consentProceduresDescription.trim(),
      disposalClinicName: values.consentDisposalClinicName.trim(),
      patientSignature: values.consentPatientSignature,
      patientPrintedName: values.consentPatientPrintedName.trim(),
      patientSignedDate: values.consentPatientSignedDate,
      witnessSignature: values.consentWitnessSignature,
      witnessPrintedName: values.consentWitnessPrintedName.trim(),
      witnessSignedDate: values.consentWitnessSignedDate,
      guardianSignature: values.consentGuardianSignature,
      guardianPrintedName: values.consentGuardianPrintedName.trim(),
      guardianSignedDate: values.consentGuardianSignedDate,
      postOpAckSignature: values.consentPostOpAckSignature,
      postOpAckPrintedName: values.consentPostOpAckPrintedName.trim(),
      postOpAckSignedDate: values.consentPostOpAckSignedDate,
    },
  }
}

// Per-tab completion checks that gate the create-patient wizard: a tab can
// only be reached once every tab before it is complete, and the form can
// only be submitted once the Consent & Waiver tab (the last one) is
// complete.
export function isPatientInfoTabComplete(values: PatientIntakeFormValues) {
  return (
    values.firstName.trim().length > 0 &&
    values.lastName.trim().length > 0 &&
    values.phone.trim().length > 0 &&
    values.address.trim().length > 0 &&
    values.birthday.length > 0
  )
}

export function isDentalVisitTabComplete(values: PatientIntakeFormValues) {
  return values.chiefComplaint.trim().length > 0
}

export function isMedicalHistoryTabComplete(values: PatientIntakeFormValues) {
  return (
    values.medicalHistorySignature !== null &&
    values.medicalHistorySignedAt.length > 0
  )
}

export function isConsentTabComplete(values: PatientIntakeFormValues) {
  const guardianOk =
    !isMinor(values.birthday) ||
    (values.consentGuardianSignature !== null &&
      values.consentGuardianSignedDate.length > 0)

  return (
    values.consentClinicName.trim().length > 0 &&
    values.consentDentistName.trim().length > 0 &&
    values.consentProceduresDescription.trim().length > 0 &&
    values.consentPatientSignature !== null &&
    values.consentPatientSignedDate.length > 0 &&
    guardianOk
  )
}
