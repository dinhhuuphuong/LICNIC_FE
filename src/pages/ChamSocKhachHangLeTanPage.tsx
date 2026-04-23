import { PageCard } from '@/components/common/PageCard';
import { StatePanel } from '@/components/common/StatePanel';
import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getMyNotifications } from '@/services/notificationService';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

export function ChamSocKhachHangLeTanPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Chăm Sóc Khách Hàng' : 'NHA KHOA TAN TAM | Customer care');

  const notificationsQuery = useQuery({
    queryKey: ['receptionistCustomerCareNotifications'],
    queryFn: () =>
      getMyNotifications({
        page: 1,
        limit: 50,
      }),
    enabled: !!user && normalizeRoleName(user.role?.roleName) === ROLE.RECEPTIONIST.toLowerCase(),
  });

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={isVi ? 'Vui lòng đăng nhập để xem khu vực chăm sóc khách hàng.' : 'Please sign in to view customer care.'}
        action={
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white"
            onClick={() => navigate(ROUTES.login)}
          >
            {isVi ? 'Đăng nhập' : 'Login'}
          </button>
        }
      />
    );
  }

  if (normalizeRoleName(user.role?.roleName) !== ROLE.RECEPTIONIST.toLowerCase()) {
    return (
      <StatePanel
        centered
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không có quyền truy cập' : 'Access denied'}
        description={isVi ? 'Trang này chỉ dành cho tài khoản lễ tân.' : 'This page is only available for receptionist accounts.'}
        action={
          <button type="button" className="text-sm font-semibold text-blue-600 underline" onClick={() => navigate(ROUTES.home)}>
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </button>
        }
      />
    );
  }

  if (notificationsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-slate-200" />
        <div className="h-32 rounded-2xl bg-slate-100" />
        <div className="h-32 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (notificationsQuery.isError) {
    return (
      <StatePanel
        tone="danger"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không tải được dữ liệu chăm sóc khách hàng' : 'Could not load customer care data'}
        description={notificationsQuery.error instanceof Error ? notificationsQuery.error.message : 'Error'}
      />
    );
  }

  const items = notificationsQuery.data?.data.items ?? [];

  return (
    <div className="mx-auto w-full max-w-[1360px]">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Chăm Sóc Khách Hàng' : 'Customer care'}</h1>
      </header>

      <div className="grid gap-4">
        {items.length === 0 ? (
          <PageCard>
            <p className="text-sm text-slate-600">
              {isVi ? 'Chưa có dữ liệu chăm sóc khách hàng.' : 'No customer care items yet.'}
            </p>
          </PageCard>
        ) : (
          items.map((item) => (
            <PageCard key={item.notificationId}>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-bold text-slate-900">{item.title}</p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    {item.type}
                  </span>
                  {!item.isRead ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {isVi ? 'Chưa đọc' : 'Unread'}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-slate-600">{item.content}</p>
                <p className="text-xs text-slate-400">{item.createdAt}</p>
              </div>
            </PageCard>
          ))
        )}
      </div>
    </div>
  );
}
