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
  role?: number;
  status?: string;
  keyword?: string;
};

const USERS_URL = '/users';

export function getUsers(params: GetUsersParams = {}) {
  const limit = params.limit ?? 10;
  const page = params.page ?? 1;
  const queryParams = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  });

  if (params.role !== undefined) {
    queryParams.set('role', String(params.role));
  }

  if (params.status) {
    queryParams.set('status', params.status);
  }

  if (params.keyword) {
    queryParams.set('keyword', params.keyword);
  }

  const query = queryParams.toString();

  // Example: GET `${VITE_ENDPOINT_API}/users?role=2&status=active&keyword=nguyen%20van%20a&limit=10&page=1`
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

/** PUT `/users/me` — cập nhật profile user đang đăng nhập (không gồm email). */
export type UpdateMePayload = {
  name?: string;
  phone?: string | null;
  avatar?: string | null;
};

export type UpdateMeResponse = import('@/services/http').Response<User>;

/**
 * Cập nhật profile. Gửi `avatarFile` để upload ảnh (multipart); không có file thì dùng JSON (avatar = URL hoặc null).
 */
export function updateMe(payload: UpdateMePayload, avatarFile?: File | null) {
  if (avatarFile && avatarFile.size > 0) {
    const form = new FormData();
    if (payload.name !== undefined) form.append('name', payload.name);
    if (payload.phone !== undefined && payload.phone !== null) {
      form.append('phone', payload.phone);
    } else {
      form.append('phone', '');
    }
    if (payload.avatar !== undefined) {
      form.append('avatar', payload.avatar ?? '');
    }
    form.append('avatarFile', avatarFile);
    return http<UpdateMeResponse>(`${USERS_URL}/me`, {
      method: 'PUT',
      headers: { accept: '*/*' },
      body: form,
    });
  }

  return http<UpdateMeResponse>(`${USERS_URL}/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}
