import { http, type PaginationResponse, type Response } from '@/services/http';

export type Medicine = {
  medicineId: number;
  medicineName: string;
  activeIngredient?: string | null;
  description?: string | null;
  price?: number | null;
  createdAt?: string;
  deletedAt?: string | null;
};

export type GetMedicinesParams = {
  keyword?: string;
  page?: number;
  limit?: number;
};

export type GetMedicinesResponse = PaginationResponse<Medicine>;

export function getMedicines(params: GetMedicinesParams = {}) {
  const sp = new URLSearchParams();
  if (params.keyword) sp.set('keyword', params.keyword);
  if (params.page != null) sp.set('page', String(params.page));
  if (params.limit != null) sp.set('limit', String(params.limit));
  const query = sp.toString();
  const url = query ? `/medicines?${query}` : '/medicines';

  return http<GetMedicinesResponse>(url, {
    headers: { accept: '*/*' },
  });
}

const MEDICINES_URL = '/medicines';

export type GetMedicineDetailResponse = Response<Medicine>;

export function getMedicineDetail(medicineId: number) {
  return http<GetMedicineDetailResponse>(`${MEDICINES_URL}/${medicineId}`, {
    headers: { accept: '*/*' },
  });
}

export type CreateMedicinePayload = {
  medicineName: string;
  activeIngredient: string;
  description: string;
  price: number;
};

export type CreateMedicineResponse = Response<Medicine>;

export function createMedicine(payload: CreateMedicinePayload) {
  return http<CreateMedicineResponse>(MEDICINES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type UpdateMedicinePayload = Partial<CreateMedicinePayload>;

export type UpdateMedicineResponse = Response<Medicine>;

export function updateMedicine(medicineId: number, payload: UpdateMedicinePayload) {
  return http<UpdateMedicineResponse>(`${MEDICINES_URL}/${medicineId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type DeleteMedicineResponse = Response<null>;

export function deleteMedicine(medicineId: number) {
  return http<DeleteMedicineResponse>(`${MEDICINES_URL}/${medicineId}`, {
    method: 'DELETE',
    headers: {
      accept: '*/*',
    },
  });
}
