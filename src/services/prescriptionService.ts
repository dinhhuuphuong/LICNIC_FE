import { http, type PaginationResponse } from '@/services/http';

export type Prescription = {
  prescriptionId: number;
  recordId: number;
  medicineName: string;
  dosage: string;
  instruction: string;
  createdAt: string;
};

export type ListPrescriptionsForMyRecordParams = {
  recordId: number;
  page?: number;
  limit?: number;
};

export type ListPrescriptionsForMyRecordResponse = PaginationResponse<Prescription>;

export function listPrescriptionsForMyRecord(params: ListPrescriptionsForMyRecordParams) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  const q = sp.toString();
  const base = `/prescriptions/me/by-record/${params.recordId}`;
  const url = q ? `${base}?${q}` : base;
  return http<ListPrescriptionsForMyRecordResponse>(url, {
    headers: { accept: '*/*' },
  });
}
