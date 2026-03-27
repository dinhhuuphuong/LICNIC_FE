import { http, type PaginationResponse, type Response } from '@/services/http';

export type ServiceCategory = {
  categoryId: number;
  categoryName: string;
  description: string;
  createdAt: string;
  deletedAt: string | null;
};

export type GetServiceCategoriesResponse = PaginationResponse<ServiceCategory>;

export type GetServiceCategoriesParams = {
  limit?: number;
  page?: number;
  keyword?: string;
};

const SERVICE_CATEGORIES_URL = '/service-categories';

export function getServiceCategories(params: GetServiceCategoriesParams = {}) {
  const limit = params.limit ?? 10;
  const page = params.page ?? 1;

  const queryParams = new URLSearchParams({
    limit: String(limit),
    page: String(page),
    keyword: params.keyword ?? '',
  });

  return http<GetServiceCategoriesResponse>(`${SERVICE_CATEGORIES_URL}?${queryParams.toString()}`);
}

export type GetServiceCategoryDetailResponse = Response<ServiceCategory>;

export function getServiceCategoryDetail(categoryId: number) {
  return http<GetServiceCategoryDetailResponse>(`${SERVICE_CATEGORIES_URL}/${categoryId}`);
}

export type CreateServiceCategoryPayload = {
  categoryName: string;
  description: string;
};

export type CreateServiceCategoryResponse = Response<ServiceCategory>;

export function createServiceCategory(payload: CreateServiceCategoryPayload) {
  return http<CreateServiceCategoryResponse>(SERVICE_CATEGORIES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type UpdateServiceCategoryPayload = Partial<CreateServiceCategoryPayload>;

export type UpdateServiceCategoryResponse = Response<ServiceCategory>;

export function updateServiceCategory(categoryId: number, payload: UpdateServiceCategoryPayload) {
  return http<UpdateServiceCategoryResponse>(`${SERVICE_CATEGORIES_URL}/${categoryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type DeleteServiceCategoryResponse = Response<null>;

export function deleteServiceCategory(categoryId: number) {
  return http<DeleteServiceCategoryResponse>(`${SERVICE_CATEGORIES_URL}/${categoryId}`, {
    method: 'DELETE',
    headers: {
      accept: '*/*',
    },
  });
}
