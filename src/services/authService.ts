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

function logAuthDebug(label: string, payload: Record<string, unknown>) {
    if (!import.meta.env.DEV) return;
    console.group(`[auth debug] ${label}`);
    console.table(payload);
    console.groupEnd();
}

export async function register(payload: RegisterPayload) {
    logAuthDebug('register request', {
        url: `${import.meta.env.VITE_ENDPOINT_API}${REGISTER_URL}`,
        method: 'POST',
        name: payload.name,
        email: payload.email,
        passwordLength: payload.password.length,
        phone: payload.phone,
        roleId: payload.roleId,
        otp: payload.otp,
        hasAvatar: Boolean(payload.avatar),
        avatarName: payload.avatar?.name ?? null,
        avatarType: payload.avatar?.type ?? null,
        avatarSize: payload.avatar?.size ?? null,
    });

    if (payload.avatar) {
        const formData = new FormData();

        formData.append('name', payload.name);
        formData.append('email', payload.email);
        formData.append('password', payload.password);
        formData.append('phone', payload.phone);
        formData.append('roleId', String(payload.roleId));
        formData.append('otp', payload.otp);
        formData.append('avatar', payload.avatar);

        return http<RegisterResponse>(REGISTER_URL, {
            method: 'POST',
            body: formData,
            skipAuth: true,
            skipRefresh: true,
        });
    }

    return http<RegisterResponse>(REGISTER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: payload.name,
            email: payload.email,
            password: payload.password,
            phone: payload.phone,
            roleId: payload.roleId,
            otp: payload.otp,
        }),
        skipAuth: true,
        skipRefresh: true,
    });
}

export type RequestOtpPayload = {
    email: string;
};

export type RequestOtpResponse = unknown;

export function requestOtp(payload: RequestOtpPayload) {
    logAuthDebug('request otp', {
        url: `${import.meta.env.VITE_ENDPOINT_API}${REQUEST_OTP_URL}`,
        method: 'POST',
        email: payload.email,
    });

    return http<RequestOtpResponse>(REQUEST_OTP_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        skipAuth: true,
        skipRefresh: true,
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
    logAuthDebug('login request', {
        url: `${import.meta.env.VITE_ENDPOINT_API}${LOGIN_URL}`,
        method: 'POST',
        email: payload.email,
        passwordLength: payload.password.length,
    });

    return http<LoginResponse>(LOGIN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        skipAuth: true,
        skipRefresh: true,
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
