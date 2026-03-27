import { http, type PaginationResponse, type Response } from '@/services/http';

export type ServiceCategoryLite = {
  categoryId: number;
  categoryName: string;
  description: string;
  createdAt: string;
  deletedAt: string | null;
};

export type Service = {
  serviceId: number;
  serviceName: string;
  whatIs: string;
  method: string;
  cost: number;
  process: string;
  trustedAddress: string;
  status: boolean;
  categoryId: number;
  category?: ServiceCategoryLite | null;
  createdAt: string;
  deletedAt: string | null;
};

export type GetServicesResponse = PaginationResponse<Service>;

export type GetServicesParams = {
  limit?: number;
  page?: number;
  status?: boolean;
  category?: number;
  keyword?: string;
};

const SERVICES_URL = '/services';

export function getServices(params: GetServicesParams = {}) {
  const limit = params.limit ?? 10;
  const page = params.page ?? 1;

  const queryParams = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  });

  if (params.status !== undefined) {
    queryParams.set('status', String(params.status));
  }

  if (params.category !== undefined) {
    queryParams.set('category', String(params.category));
  }

  if (params.keyword) {
    queryParams.set('keyword', params.keyword);
  }

  return http<GetServicesResponse>(`${SERVICES_URL}?${queryParams.toString()}`);
}

export type GetServiceDetailResponse = Response<Service>;

export function getServiceDetail(serviceId: number) {
  return http<GetServiceDetailResponse>(`${SERVICES_URL}/${serviceId}`);
}

export type CreateServicePayload = {
  serviceName: string;
  whatIs: string;
  method: string;
  cost: number;
  process: string;
  trustedAddress: string;
  status: boolean;
  categoryId: number;
};

export type CreateServiceResponse = Response<Service>;

export function createService(payload: CreateServicePayload) {
  return http<CreateServiceResponse>(SERVICES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type UpdateServicePayload = Partial<
  Pick<
    CreateServicePayload,
    'serviceName' | 'whatIs' | 'method' | 'cost' | 'process' | 'trustedAddress' | 'status' | 'categoryId'
  >
>;

export type UpdateServiceResponse = Response<Service>;

export function updateService(serviceId: number, payload: UpdateServicePayload) {
  return http<UpdateServiceResponse>(`${SERVICES_URL}/${serviceId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type DeleteServiceResponse = Response<null>;

export function deleteService(serviceId: number) {
  return http<DeleteServiceResponse>(`${SERVICES_URL}/${serviceId}`, {
    method: 'DELETE',
    headers: {
      accept: '*/*',
    },
  });
}
