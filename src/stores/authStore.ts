import { getMe } from '@/services/authService';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuthUser = {
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

type AuthState = {
    user: AuthUser | null;
    setUser: (user: AuthUser) => void;
    clearUser: () => void;
};

function getLegacyUserFromLocalStorage(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
        const accessToken = window.localStorage.getItem('accessToken');
        // Nếu đã có token thì ưu tiên lấy user từ endpoint `/auth/me`.
        if (accessToken) return null;

        const raw = window.localStorage.getItem('user');
        if (!raw) return null;
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

const legacyInitialUser = getLegacyUserFromLocalStorage();

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: legacyInitialUser,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: 'auth-store',
            // Chỉ persist phần user theo yêu cầu.
            partialize: (state) => ({ user: state.user }),
            onRehydrateStorage: () => async (state) => {
                if (!state) return;
                if (typeof window === 'undefined') return;

                const accessToken = window.localStorage.getItem('accessToken');
                if (!accessToken) return;

                try {
                    const response = await getMe(accessToken);
                    if (response?.data) state.setUser(response.data);
                } catch {
                    // Không phá state nếu gọi `/auth/me` thất bại.
                }
            },
        },
    ),
);
