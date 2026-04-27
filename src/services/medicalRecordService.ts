import { http, type PaginationResponse, type Response } from '@/services/http';

export type MedicalRecordDoctor = {
  doctorId: number;
  userId?: number;
  specialization?: string;
  user?: { name?: string; email?: string };
};

export type MedicalRecordPatient = {
  patientId: number;
  userId?: number;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  medicalHistory?: string;
  user?: { name?: string; email?: string };
};

export type MedicalRecordAppointment = {
  appointmentId: number;
  appointmentDate?: string;
  appointmentTime?: string;
  status?: string;
};

/** Bản ghi từ API (có thể kèm quan hệ). */
export type MedicalRecord = {
  recordId: number;
  patientId: number;
  doctorId: number;
  appointmentId: number;
  diagnosis: string;
  treatment: string;
  note: string | null;
  createdAt: string;
  patient?: MedicalRecordPatient;
  doctor?: MedicalRecordDoctor;
  appointment?: MedicalRecordAppointment;
};

export type ListMyMedicalRecordsParams = {
  page?: number;
  limit?: number;
};

export type ListMyMedicalRecordsResponse = PaginationResponse<MedicalRecord>;
export type ListMedicalRecordsParams = {
  patientId?: number;
  doctorId?: number;
  appointmentId?: number;
  page?: number;
  limit?: number;
};

export type ListMedicalRecordsResponse = PaginationResponse<MedicalRecord>;

export type GetMyMedicalRecordResponse = Response<MedicalRecord>;
export type GetMedicalRecordDetailResponse = Response<MedicalRecord>;

export type UpdateMedicalRecordPayload = {
  appointmentId: number;
  diagnosis: string;
  treatment: string;
  note?: string;
};

export type UpdateMedicalRecordResponse = Response<MedicalRecord>;
export type DeleteMedicalRecordResponse = Response<MedicalRecord>;

export type CreateMedicalRecordPrescriptionPayload = {
  medicineId: number;
  quantity: number;
  price: number;
  dosage: string;
  instruction: string;
};

export type CreateMedicalRecordWithPrescriptionsPayload = {
  appointmentId: number;
  diagnosis: string;
  treatment: string;
  note?: string;
  prescriptions: CreateMedicalRecordPrescriptionPayload[];
};

export type CreateMedicalRecordWithPrescriptionsResponse = Response<MedicalRecord>;

export function listMyMedicalRecords(params?: ListMyMedicalRecordsParams) {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set('page', String(params.page));
  if (params?.limit != null) sp.set('limit', String(params.limit));
  const q = sp.toString();
  const url = q ? `/medical-records/me?${q}` : '/medical-records/me';
  return http<ListMyMedicalRecordsResponse>(url, {
    headers: { accept: '*/*' },
  });
}

export function listMedicalRecords(params?: ListMedicalRecordsParams) {
  const sp = new URLSearchParams();
  if (params?.patientId != null) sp.set('patientId', String(params.patientId));
  if (params?.doctorId != null) sp.set('doctorId', String(params.doctorId));
  if (params?.appointmentId != null) sp.set('appointmentId', String(params.appointmentId));
  if (params?.page != null) sp.set('page', String(params.page));
  if (params?.limit != null) sp.set('limit', String(params.limit));
  const q = sp.toString();
  const url = q ? `/medical-records?${q}` : '/medical-records';
  return http<ListMedicalRecordsResponse>(url, {
    headers: { accept: '*/*' },
  });
}

export function getMyMedicalRecord(recordId: number) {
  return http<GetMyMedicalRecordResponse>(`/medical-records/me/${recordId}`, {
    headers: { accept: '*/*' },
  });
}

export function getMedicalRecordDetail(recordId: number) {
  return http<GetMedicalRecordDetailResponse>(`/medical-records/${recordId}`, {
    headers: { accept: '*/*' },
  });
}

export function updateMedicalRecord(recordId: number, payload: UpdateMedicalRecordPayload) {
  return http<UpdateMedicalRecordResponse>(`/medical-records/${recordId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export function deleteMedicalRecord(recordId: number) {
  return http<DeleteMedicalRecordResponse>(`/medical-records/${recordId}`, {
    method: 'DELETE',
    headers: { accept: '*/*' },
  });
}

export function createMedicalRecordWithPrescriptions(payload: CreateMedicalRecordWithPrescriptionsPayload) {
  return http<CreateMedicalRecordWithPrescriptionsResponse>('/medical-records/with-prescriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}
