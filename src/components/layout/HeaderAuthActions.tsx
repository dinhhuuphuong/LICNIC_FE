import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type HeaderAuthActionsProps = {
    loginLabel: string;
    registerLabel: string;
};

const DEFAULT_AVATAR_URL = '/imgs/default-avatar.jpg';

export function HeaderAuthActions({
    loginLabel,
    registerLabel,
}: HeaderAuthActionsProps) {
    const user = useAuthStore((state) => state.user);
    const clearUser = useAuthStore((state) => state.clearUser);
    const navigate = useNavigate();
    const { language } = useLanguage();

    const initialAvatarSrc = useMemo(() => {
        if (!user?.avatar) return DEFAULT_AVATAR_URL;
        return user.avatar;
    }, [user?.avatar]);

    const [avatarSrc, setAvatarSrc] = useState(initialAvatarSrc);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Nếu user đổi (log in/out) thì đóng popover để tránh UI cũ.
        setIsPopoverOpen(false);
    }, [user]);

    useEffect(() => {
        setAvatarSrc(initialAvatarSrc);
    }, [initialAvatarSrc]);

    useEffect(() => {
        if (!isPopoverOpen) return;

        const handleDocumentMouseDown = (event: MouseEvent) => {
            if (!containerRef.current) return;
            const target = event.target as Node | null;
            if (!target) return;

            if (!containerRef.current.contains(target)) {
                setIsPopoverOpen(false);
            }
        };

        document.addEventListener('mousedown', handleDocumentMouseDown);
        return () => {
            document.removeEventListener('mousedown', handleDocumentMouseDown);
        };
    }, [isPopoverOpen]);

    const logoutLabel = language === 'vi' ? 'Đăng xuất' : 'Logout';
    const homeLabel = language === 'vi' ? 'Trang chủ' : 'Home';

    const handleLogout = () => {
        // Clear auth tokens first so future authenticated requests won't happen.
        window.localStorage.removeItem('accessToken');
        window.localStorage.removeItem('refreshToken');
        clearUser();
        setIsPopoverOpen(false);
        navigate(ROUTES.login);
    };

    if (!user) {
        return (
            <>
                <Link
                    className='inline-flex h-11 items-center justify-center rounded-full border border-sky-200 bg-white px-5 text-sm font-bold text-sky-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:shadow'
                    to={ROUTES.login}
                >
                    {loginLabel}
                </Link>
                <Link
                    className='inline-flex h-11 items-center justify-center rounded-full border border-blue-200 bg-linear-to-b from-blue-50 to-blue-100 px-5 text-sm font-bold text-blue-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:from-blue-100 hover:to-blue-200 hover:shadow'
                    to={ROUTES.register}
                >
                    {registerLabel}
                </Link>
            </>
        );
    }

    return (
        <div ref={containerRef} className='relative'>
            <button
                className='inline-flex w-11 h-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-slate-300'
                type='button'
                aria-label={user.name}
                aria-expanded={isPopoverOpen}
                onClick={() => setIsPopoverOpen((v) => !v)}
                title={user.name}
            >
                <img
                    className='shrink-0 h-10 w-10 rounded-full object-cover'
                    src={avatarSrc}
                    alt={user.name}
                    onError={() => setAvatarSrc(DEFAULT_AVATAR_URL)}
                />
            </button>

            {isPopoverOpen ? (
                <div
                    className='absolute right-0 top-full z-20 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg'
                    role='menu'
                    aria-label='User menu'
                    onClick={(e) => e.stopPropagation()}
                >
                    <Link
                        className='block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100'
                        to={ROUTES.home}
                        role='menuitem'
                        onClick={() => setIsPopoverOpen(false)}
                    >
                        {homeLabel}
                    </Link>
                    <button
                        className='mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50'
                        type='button'
                        role='menuitem'
                        onClick={handleLogout}
                    >
                        {logoutLabel}
                    </button>
                </div>
            ) : null}
        </div>
    );
}
