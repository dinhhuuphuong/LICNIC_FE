import { http, httpAllow404, type Response } from '@/services/http';

export type PatientGender = 'Male' | 'Female';

export type PatientUser = {
  userId: number;
  name: string;
  email: string;
  phone: string;
  roleId: number;
  avatar?: string | null;
  status?: string;
  role?: {
    roleId: number;
    roleName: string;
  };
};

export type Patient = {
  patientId: number;
  userId: number;
  user?: PatientUser;
  dateOfBirth: string;
  gender: PatientGender;
  address: string | null;
  medicalHistory: string | null;
  createdAt: string;
};

export type CreatePatientPayload = {
  dateOfBirth: string;
  gender: PatientGender;
  address?: string | null;
  medicalHistory?: string | null;
};

export type UpdatePatientPayload = {
  dateOfBirth?: string;
  gender?: PatientGender;
  address?: string | null;
  medicalHistory?: string | null;
};

const PATIENTS_URL = '/patients';

export type GetMyPatientResponse = Response<Patient>;

/** GET /patients/me — `null` nếu chưa tạo hồ sơ (404). */
export function getMyPatientProfile() {
  return httpAllow404<GetMyPatientResponse>(`${PATIENTS_URL}/me`, {
    headers: { accept: '*/*' },
  });
}

export type CreatePatientResponse = Response<Patient>;

export function createPatientProfile(payload: CreatePatientPayload) {
  return http<CreatePatientResponse>(PATIENTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type UpdatePatientResponse = Response<Patient>;

export function updatePatientProfile(patientId: number, payload: UpdatePatientPayload) {
  return http<UpdatePatientResponse>(`${PATIENTS_URL}/${patientId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type GetPatientDetailResponse = Response<Patient>;

export function getPatientProfile(patientId: number) {
  return http<GetPatientDetailResponse>(`${PATIENTS_URL}/${patientId}`, {
    headers: { accept: '*/*' },
  });
}
