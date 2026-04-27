import { http, type PaginationResponse, type Response } from '@/services/http';

export type Prescription = {
  prescriptionId: number;
  recordId: number;
  medicineName: string;
  dosage: string;
  instruction: string;
  createdAt: string;
};

export type PrescriptionMedicine = {
  medicineId: number;
  medicineName: string;
  activeIngredient?: string | null;
  description?: string | null;
  price?: number | null;
};

export type RecordPrescription = {
  prescriptionId: number;
  recordId: number;
  medicineId: number;
  quantity: number;
  price: number;
  note?: string | null;
  dosage: string;
  instruction: string;
  createdAt: string;
  medicine?: PrescriptionMedicine;
};

export type PrescriptionDetail = RecordPrescription & {
  medicalRecord?: {
    recordId: number;
    patientId: number;
    doctorId: number;
    appointmentId: number;
    diagnosis: string;
    treatment: string;
    note?: string | null;
    createdAt: string;
    deletedAt?: string | null;
  };
  deletedAt?: string | null;
};

export type ListPrescriptionsForMyRecordParams = {
  recordId: number;
  page?: number;
  limit?: number;
};

export type ListPrescriptionsForMyRecordResponse = PaginationResponse<Prescription>;
export type ListPrescriptionsByRecordResponse = PaginationResponse<RecordPrescription>;
export type GetPrescriptionDetailResponse = Response<PrescriptionDetail>;

export type UpdatePrescriptionPayload = {
  recordId: number;
  medicineId: number;
  quantity: number;
  price: number;
  note?: string;
  dosage: string;
  instruction: string;
};
export type UpdatePrescriptionResponse = Response<PrescriptionDetail>;
export type CreatePrescriptionPayload = UpdatePrescriptionPayload;
export type CreatePrescriptionResponse = Response<PrescriptionDetail>;
export type DeletePrescriptionResponse = Response<null>;

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

export type ListPrescriptionsByRecordParams = {
  recordId: number;
  page?: number;
  limit?: number;
};

export function listPrescriptionsByRecord(params: ListPrescriptionsByRecordParams) {
  const sp = new URLSearchParams();
  sp.set('recordId', String(params.recordId));
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  const q = sp.toString();
  const url = q ? `/prescriptions?${q}` : '/prescriptions';
  return http<ListPrescriptionsByRecordResponse>(url, {
    headers: { accept: '*/*' },
  });
}

export function getPrescriptionDetail(prescriptionId: number) {
  return http<GetPrescriptionDetailResponse>(`/prescriptions/${prescriptionId}`, {
    headers: { accept: '*/*' },
  });
}

export function updatePrescription(prescriptionId: number, payload: UpdatePrescriptionPayload) {
  return http<UpdatePrescriptionResponse>(`/prescriptions/${prescriptionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export function createPrescription(payload: CreatePrescriptionPayload) {
  return http<CreatePrescriptionResponse>('/prescriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export function deletePrescription(prescriptionId: number) {
  return http<DeletePrescriptionResponse>(`/prescriptions/${prescriptionId}`, {
    method: 'DELETE',
    headers: { accept: '*/*' },
  });
}
