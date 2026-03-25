import { http, PaginationResponse } from '@/services/http';

export type UserRole = {
  roleId: number;
  roleName: string;
};

export type User = {
  userId: number;
  name: string;
  email: string;
  phone: string;
  roleId: number;
  // Backend có thể chỉ trả `roleId` (không trả full object `role`).
  role?: UserRole | null;
  avatar: string | null;
  status: string;
  createdAt: string;
  deletedAt: string | null;
};

export type GetUsersResponse = PaginationResponse<User>;

export type GetUsersParams = {
  limit?: number;
  page?: number;
};

const USERS_URL = '/users';

export function getUsers(params: GetUsersParams = {}) {
  const limit = params.limit ?? 10;
  const page = params.page ?? 1;

  const query = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  }).toString();

  // Example: GET `${VITE_ENDPOINT_API}/users?limit=10&page=1`
  return http<GetUsersResponse>(`${USERS_URL}?${query}`);
}

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
  roleId: number;
  status: string;
};

export type CreateUserResponse = import('@/services/http').Response<User>;

export function createUser(payload: CreateUserPayload) {
  return http<CreateUserResponse>(USERS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}
