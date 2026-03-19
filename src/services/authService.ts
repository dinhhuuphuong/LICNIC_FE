import { http, type Response } from '@/services/http';

export type RegisterPayload = {
    name: string;
    email: string;
    password: string;
    phone: string;
    roleId: number;
    otp: string;
    avatar?: File | null;
};

export type RegisterResponse = Response<{
    user: {
        userId: number;
        name: string;
        email: string;
        phone: string;
        roleId: number | string;
        // Backend có thể trả về `role`, hoặc chỉ trả `roleId`.
        role?: {
            roleId: number;
            roleName: string;
        } | null;
        avatar: string | null;
        status: string;
        createdAt: string;
        deletedAt: string | null;
    };
    accessToken: string;
    refreshToken: string;
}>;

const REGISTER_URL = '/auth/register';
const REQUEST_OTP_URL = '/auth/register/request-otp';

export async function register(payload: RegisterPayload) {
    const formData = new FormData();

    formData.append('name', payload.name);
    formData.append('email', payload.email);
    formData.append('password', payload.password);
    formData.append('phone', payload.phone);
    formData.append('roleId', String(payload.roleId));
    formData.append('otp', payload.otp);

    if (payload.avatar) {
        formData.append('avatar', payload.avatar);
    }

    return http<RegisterResponse>(REGISTER_URL, {
        method: 'POST',
        body: formData,
    });
}

export type RequestOtpPayload = {
    email: string;
};

export type RequestOtpResponse = unknown;

export function requestOtp(payload: RequestOtpPayload) {
    return http<RequestOtpResponse>(REQUEST_OTP_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
}

export type LoginPayload = {
    email: string;
    password: string;
};

export type LoginResponse = Response<{
    user: {
        userId: number;
        name: string;
        email: string;
        phone: string;
        roleId: number;
        role: {
            roleId: number;
            roleName: string;
        };
        avatar: string;
        status: string;
        createdAt: string;
        deletedAt: string | null;
    };
    accessToken: string;
    refreshToken: string;
}>;

const LOGIN_URL = '/auth/login';

export function login(payload: LoginPayload) {
    return http<LoginResponse>(LOGIN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
}

export type AuthMeResponse = Response<{
    userId: number;
    name: string;
    email: string;
    phone: string;
    roleId: number;
    role: {
        roleId: number;
        roleName: string;
    };
    avatar: string;
    status: string;
    createdAt: string;
    deletedAt: string | null;
}>;

const ME_URL = '/auth/me';

export async function getMe(accessToken: string) {
    return http<AuthMeResponse>(ME_URL, {
        method: 'GET',
        headers: {
            accept: '*/*',
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

export type RefreshTokenResponse = Response<{
    user: {
        userId: number;
        name: string;
        email: string;
        phone: string;
        roleId: number;
        role: {
            roleId: number;
            roleName: string;
        };
        avatar: string;
        status: string;
        createdAt: string;
        deletedAt: string | null;
    };
    accessToken: string;
    refreshToken: string;
}>;

const REFRESH_URL = '/auth/refresh';

export function refreshAccessToken(refreshTokenValue: string) {
    return http<RefreshTokenResponse>(REFRESH_URL, {
        method: 'POST',
        headers: {
            accept: '*/*',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });
}
