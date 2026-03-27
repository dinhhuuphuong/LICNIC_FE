import { useQuery } from '@tanstack/react-query';

import { http, type PaginationResponse } from '@/services/http';

import { adminRolesListQueryKey } from '../queryKeys';

export type Role = {
  roleId: number;
  roleName: string;
};

export type GetRolesParams = {
  limit?: number;
  page?: number;
};

export type GetRolesResponse = PaginationResponse<Role>;

const ROLES_URL = '/roles';

export function getRoles(params: GetRolesParams = {}) {
  const limit = params.limit ?? 10;
  const page = params.page ?? 1;

  const query = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  }).toString();

  return http<GetRolesResponse>(`${ROLES_URL}?${query}`);
}

export function useGetRolesQuery(params: GetRolesParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  return useQuery<GetRolesResponse>({
    queryKey: [...adminRolesListQueryKey, page, limit],
    queryFn: () => getRoles({ page, limit }),
    staleTime: 5 * 60 * 1000,
  });
}
