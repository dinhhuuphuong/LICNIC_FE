import type { PatientGender } from '@/services/patientService';

export type PatientProfileFormValues = {
  dateOfBirth: string;
  gender: PatientGender;
  address: string;
  medicalHistory: string;
};

export function patientFormDefaultsFromPatient(p: {
  dateOfBirth: string;
  gender: PatientGender;
  address: string | null;
  medicalHistory: string | null;
}): PatientProfileFormValues {
  return {
    dateOfBirth: p.dateOfBirth,
    gender: p.gender,
    address: p.address ?? '',
    medicalHistory: p.medicalHistory ?? '',
  };
}
