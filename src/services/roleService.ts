import { http, type PaginationResponse } from '@/services/http';

export type Role = {
  roleId: number;
  roleName: string;
};

export type GetRolesResponse = PaginationResponse<Role>;

export type GetRolesParams = {
  page?: number;
  limit?: number;
};

const ROLES_URL = '/roles';

export function getRoles(params: GetRolesParams = {}) {
  const queryParams = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 50),
  });

  return http<GetRolesResponse>(`${ROLES_URL}?${queryParams.toString()}`);
}
