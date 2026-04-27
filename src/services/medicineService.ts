import { http, type Response } from '@/services/http';

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

export type GetMedicinesResponse = Response<
  | Medicine
  | Medicine[]
  | {
      items?: Medicine[];
      total?: number;
      page?: number;
      limit?: number;
    }
>;

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
