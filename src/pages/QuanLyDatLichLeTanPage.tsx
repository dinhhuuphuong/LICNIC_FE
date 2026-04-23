import { PageCard } from '@/components/common/PageCard';
import { StatePanel } from '@/components/common/StatePanel';
import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getAppointments } from '@/services/appointmentService';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

export function QuanLyDatLichLeTanPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Quản lý đặt lịch' : 'NHA KHOA TAN TAM | Appointment management');

  const appointmentsQuery = useQuery({
    queryKey: ['receptionistAppointments'],
    queryFn: () =>
      getAppointments({
        page: 1,
        limit: 200,
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
        description={isVi ? 'Vui lòng đăng nhập để quản lý đặt lịch.' : 'Please sign in to manage appointments.'}
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

  if (appointmentsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-slate-200" />
        <div className="h-40 rounded-2xl bg-slate-100" />
        <div className="h-40 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (appointmentsQuery.isError) {
    return (
      <StatePanel
        tone="danger"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không tải được danh sách lịch hẹn' : 'Could not load appointments'}
        description={appointmentsQuery.error instanceof Error ? appointmentsQuery.error.message : 'Error'}
      />
    );
  }

  const appointments = appointmentsQuery.data?.data.items ?? [];

  return (
    <div className="mx-auto w-full max-w-[1360px]">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Quản lý đặt lịch' : 'Appointment management'}</h1>
        <p className="mt-2 text-sm text-slate-600">{isVi ? 'Danh sách lịch khách hàng đã đặt.' : 'List of customer appointments.'}</p>
      </header>

      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <PageCard>
            <p className="text-sm text-slate-600">{isVi ? 'Hiện chưa có lịch hẹn nào.' : 'No appointments found.'}</p>
          </PageCard>
        ) : (
          appointments.map((item) => (
            <PageCard key={item.appointmentId}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <p className="text-lg font-bold text-slate-900">{item.patientName}</p>
                  <p className="text-sm text-slate-600">
                    {item.serviceName} - {item.doctorName}
                  </p>
                  <p className="text-sm text-slate-600">
                    {item.appointmentDate} {item.appointmentTime}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                    {isVi ? 'Trạng thái:' : 'Status:'} {item.status}
                  </span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">#{item.appointmentId}</span>
                </div>
              </div>
            </PageCard>
          ))
        )}
      </div>
    </div>
  );
}
