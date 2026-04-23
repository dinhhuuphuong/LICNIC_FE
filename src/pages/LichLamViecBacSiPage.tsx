import { PageCard } from '@/components/common/PageCard';
import { StatePanel } from '@/components/common/StatePanel';
import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getDoctors } from '@/services/doctorService';
import { getDoctorWorkSchedules } from '@/services/doctorWorkScheduleService';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

export function LichLamViecBacSiPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Lịch làm việc bác sĩ' : 'NHA KHOA TAN TAM | Doctor work schedules');

  const fromDate = dayjs().startOf('month').format('YYYY-MM-DD');
  const toDate = dayjs().endOf('month').format('YYYY-MM-DD');

  const doctorMeQuery = useQuery({
    queryKey: ['doctorProfileByUser', user?.userId],
    queryFn: async () => {
      const res = await getDoctors({ page: 1, limit: 1000 });
      return res.data.items.find((item) => item.userId === user?.userId) ?? null;
    },
    enabled: !!user && normalizeRoleName(user.role?.roleName) === ROLE.DOCTOR.toLowerCase(),
  });

  const schedulesQuery = useQuery({
    queryKey: ['doctorMySchedules', doctorMeQuery.data?.doctorId, fromDate, toDate],
    queryFn: async () =>
      getDoctorWorkSchedules({
        page: 1,
        limit: 100,
        doctorId: doctorMeQuery.data?.doctorId,
        fromDate,
        toDate,
      }),
    enabled: !!doctorMeQuery.data?.doctorId,
  });

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={isVi ? 'Vui lòng đăng nhập để xem lịch làm việc.' : 'Please sign in to view your work schedules.'}
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

  if (normalizeRoleName(user.role?.roleName) !== ROLE.DOCTOR.toLowerCase()) {
    return (
      <StatePanel
        centered
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không có quyền truy cập' : 'Access denied'}
        description={isVi ? 'Trang này chỉ dành cho tài khoản bác sĩ.' : 'This page is only available for doctor accounts.'}
        action={
          <button type="button" className="text-sm font-semibold text-blue-600 underline" onClick={() => navigate(ROUTES.home)}>
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </button>
        }
      />
    );
  }

  if (doctorMeQuery.isLoading || schedulesQuery.isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-slate-200" />
        <div className="h-40 rounded-2xl bg-slate-100" />
        <div className="h-40 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (doctorMeQuery.isError) {
    return (
      <StatePanel
        tone="danger"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không tải được hồ sơ bác sĩ' : 'Could not load doctor profile'}
        description={doctorMeQuery.error instanceof Error ? doctorMeQuery.error.message : 'Error'}
      />
    );
  }

  if (!doctorMeQuery.data) {
    return (
      <StatePanel
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Chưa tìm thấy hồ sơ bác sĩ' : 'Doctor profile not found'}
        description={
          isVi
            ? 'Tài khoản này chưa được gắn với bản ghi bác sĩ trong hệ thống.'
            : 'This account is not linked to a doctor record yet.'
        }
      />
    );
  }

  if (schedulesQuery.isError) {
    return (
      <StatePanel
        tone="danger"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không tải được lịch làm việc' : 'Could not load work schedules'}
        description={schedulesQuery.error instanceof Error ? schedulesQuery.error.message : 'Error'}
      />
    );
  }

  const schedules = schedulesQuery.data?.data.items ?? [];

  return (
    <div className="mx-auto w-full max-w-[1360px]">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Lịch làm việc' : 'Work schedules'}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {isVi
            ? `Các ca làm việc của bạn trong khoảng ${fromDate} đến ${toDate}.`
            : `Your shifts from ${fromDate} to ${toDate}.`}
        </p>
      </header>

      <div className="grid gap-4">
        {schedules.length === 0 ? (
          <PageCard>
            <p className="text-sm text-slate-600">
              {isVi ? 'Hiện chưa có lịch làm việc trong khoảng thời gian này.' : 'No work schedules found for this period.'}
            </p>
          </PageCard>
        ) : (
          schedules.map((schedule) => (
            <PageCard key={schedule.scheduleId}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-900">{schedule.workDate}</p>
                  <p className="text-sm text-slate-600">
                    {schedule.startTime} - {schedule.endTime}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                    {isVi ? 'Trạng thái:' : 'Status:'} {schedule.status}
                  </span>
                  {schedule.maxPatients != null ? (
                    <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                      {isVi ? 'Tối đa:' : 'Max patients:'} {schedule.maxPatients}
                    </span>
                  ) : null}
                  {schedule.slotDurationMinutes != null ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                      {isVi ? 'Mỗi lượt:' : 'Slot:'} {schedule.slotDurationMinutes} phút
                    </span>
                  ) : null}
                </div>
              </div>
            </PageCard>
          ))
        )}
      </div>
    </div>
  );
}
