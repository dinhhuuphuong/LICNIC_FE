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
  thumbnail?: string | null;
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

  return http<GetServicesResponse>(`${SERVICES_URL}?${queryParams.toString()}`, {
    headers: { accept: '*/*' },
  });
}

/** Trang chủ: GET /services?status=true&limit&page */
export function getFeaturedServicesForHome(options?: { limit?: number; page?: number }) {
  return getServices({
    status: true,
    limit: options?.limit ?? 10,
    page: options?.page ?? 1,
  });
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
  thumbnail?: string | null;
  thumbnailFile?: File;
};

export type CreateServiceResponse = Response<Service>;

function buildServiceFormData(payload: (CreateServicePayload | UpdateServicePayload) & { thumbnailFile?: File }) {
  const formData = new FormData();

  if ('serviceName' in payload && payload.serviceName !== undefined) {
    formData.append('serviceName', payload.serviceName);
  }
  if ('whatIs' in payload && payload.whatIs !== undefined) {
    formData.append('whatIs', payload.whatIs);
  }
  if ('method' in payload && payload.method !== undefined) {
    formData.append('method', payload.method);
  }
  if ('cost' in payload && payload.cost !== undefined) {
    formData.append('cost', String(payload.cost));
  }
  if ('process' in payload && payload.process !== undefined) {
    formData.append('process', payload.process);
  }
  if ('trustedAddress' in payload && payload.trustedAddress !== undefined) {
    formData.append('trustedAddress', payload.trustedAddress);
  }
  if ('status' in payload && payload.status !== undefined) {
    formData.append('status', String(payload.status));
  }
  if ('categoryId' in payload && payload.categoryId !== undefined) {
    formData.append('categoryId', String(payload.categoryId));
  }
  if ('thumbnail' in payload && payload.thumbnail !== undefined) {
    formData.append('thumbnail', payload.thumbnail ?? '');
  }
  if (payload.thumbnailFile) {
    formData.append('thumbnail', payload.thumbnailFile);
  }

  return formData;
}

export function createService(payload: CreateServicePayload) {
  const { thumbnailFile, ...rest } = payload;

  if (thumbnailFile) {
    const formData = buildServiceFormData({ ...rest, thumbnailFile });
    return http<CreateServiceResponse>(SERVICES_URL, {
      method: 'POST',
      headers: {
        accept: '*/*',
      },
      body: formData,
    });
  }

  return http<CreateServiceResponse>(SERVICES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(rest),
  });
}

export type UpdateServicePayload = Partial<
  Pick<
    CreateServicePayload,
    'serviceName' | 'whatIs' | 'method' | 'cost' | 'process' | 'trustedAddress' | 'status' | 'categoryId' | 'thumbnail'
  >
> & { thumbnailFile?: File };

export type UpdateServiceResponse = Response<Service>;

export function updateService(serviceId: number, payload: UpdateServicePayload) {
  const { thumbnailFile, ...rest } = payload;

  if (thumbnailFile) {
    const formData = buildServiceFormData({ ...rest, thumbnailFile });
    return http<UpdateServiceResponse>(`${SERVICES_URL}/${serviceId}`, {
      method: 'PUT',
      headers: {
        accept: '*/*',
      },
      body: formData,
    });
  }

  return http<UpdateServiceResponse>(`${SERVICES_URL}/${serviceId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(rest),
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
