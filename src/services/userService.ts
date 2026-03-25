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

export type GetUserDetailResponse = import('@/services/http').Response<User>;

export function getUserDetail(userId: number) {
  return http<GetUserDetailResponse>(`${USERS_URL}/${userId}`);
}

// Backend PUT `/users/:id` có thể nhận subset fields (vd: { name, status })
// nhưng shape nhìn chung tương tự CreateUserPayload.
export type UpdateUserPayload = Partial<CreateUserPayload>;

export type UpdateUserResponse = import('@/services/http').Response<User>;

export function updateUser(userId: number, payload: UpdateUserPayload) {
  return http<UpdateUserResponse>(`${USERS_URL}/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type DeleteUserResponse = import('@/services/http').Response<null>;

export function deleteUser(userId: number) {
  return http<DeleteUserResponse>(`${USERS_URL}/${userId}`, {
    method: 'DELETE',
    headers: {
      accept: '*/*',
    },
  });
}
