import { http, type PaginationResponse, type Response } from '@/services/http';

export type MedicalRecordDoctor = {
  doctorId: number;
  userId?: number;
  specialization?: string;
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
  doctor?: MedicalRecordDoctor;
  appointment?: MedicalRecordAppointment;
};

export type ListMyMedicalRecordsParams = {
  page?: number;
  limit?: number;
};

export type ListMyMedicalRecordsResponse = PaginationResponse<MedicalRecord>;

export type GetMyMedicalRecordResponse = Response<MedicalRecord>;

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

export function getMyMedicalRecord(recordId: number) {
  return http<GetMyMedicalRecordResponse>(`/medical-records/me/${recordId}`, {
    headers: { accept: '*/*' },
  });
}
