import SelectDateModeParam from '@/components/common/date-pickers/select-date-mode-param';
import { PageCard } from '@/components/common/PageCard';
import SelectParam from '@/components/common/selects/select-param';
import { StatePanel } from '@/components/common/StatePanel';
import { appointmentStatusLabel } from '@/components/patient/patientAppointments.shared';
import DATE_FORMAT from '@/constants/date-format';
import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import { SEARCH_PARAMS } from '@/constants/search-params';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  cancelAppointmentByStaff,
  confirmAppointment,
  getAppointments,
  type AppointmentListItem,
} from '@/services/appointmentService';
import { getMyDoctorProfile } from '@/services/doctorService';
import { useAuthStore } from '@/stores/authStore';
import { formatYmdToDmy } from '@/utils/dateDisplay';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryParam } from 'use-query-params';

const DOCTOR_APPOINTMENT_STATUS_OPTIONS = [
  { value: 'pending', labelVi: 'Chờ xác nhận', labelEn: 'Pending' },
  { value: 'confirmed', labelVi: 'Đã xác nhận', labelEn: 'Confirmed' },
  { value: 'checked_in', labelVi: 'Đã check-in', labelEn: 'Checked in' },
  { value: 'completed', labelVi: 'Đã khám xong', labelEn: 'Completed' },
  { value: 'cancelled', labelVi: 'Đã hủy', labelEn: 'Cancelled' },
];

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

function appointmentStatusBadgeClass(status?: string) {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800';
    case 'confirmed':
      return 'bg-sky-100 text-sky-800';
    case 'checked_in':
      return 'bg-indigo-100 text-indigo-800';
    case 'completed':
      return 'bg-emerald-100 text-emerald-800';
    case 'cancelled':
      return 'bg-rose-100 text-rose-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function formatCurrencyVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

const QuanLyDatLichBacSiPage = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [statusFilter] = useQueryParam<string | undefined>(SEARCH_PARAMS.STATUS);
  const [fromDate] = useQueryParam<string | undefined>(SEARCH_PARAMS.FROM_DATE);
  const [toDate] = useQueryParam<string | undefined>(SEARCH_PARAMS.TO_DATE);
  const [pageParam] = useQueryParam<string | undefined>('page');
  const [actionTarget, setActionTarget] = useState<{ id: number; type: 'confirm' | 'cancel' } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [cancelModalTarget, setCancelModalTarget] = useState<AppointmentListItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useDocumentTitle(
    isVi ? 'NHA KHOA TẬN TÂM | Quản lý đặt lịch bác sĩ' : 'NHA KHOA TAN TAM | Doctor appointment management',
  );

  const currentPage = Number.isFinite(Number(pageParam)) && Number(pageParam) > 0 ? Number(pageParam) : 1;

  const doctorMeQuery = useQuery({
    queryKey: ['doctorMeProfile', user?.userId],
    queryFn: async () => {
      const res = await getMyDoctorProfile();
      return res?.data ?? null;
    },
    enabled: !!user && normalizeRoleName(user.role?.roleName) === ROLE.DOCTOR.toLowerCase(),
  });

  const appointmentsQuery = useQuery({
    queryKey: [
      'doctorAppointments',
      doctorMeQuery.data?.doctorId ?? 'none',
      statusFilter || 'all',
      fromDate || 'all',
      toDate || 'all',
      currentPage,
    ],
    queryFn: () =>
      getAppointments({
        doctorId: doctorMeQuery.data?.doctorId,
        page: currentPage,
        limit: 10,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {}),
      }),
    enabled: !!doctorMeQuery.data?.doctorId,
  });

  const handleConfirm = async (appointmentId: number) => {
    setActionError(null);
    setActionTarget({ id: appointmentId, type: 'confirm' });
    try {
      await confirmAppointment(appointmentId);
      await queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : isVi ? 'Xác nhận lịch thất bại.' : 'Confirm failed.');
    } finally {
      setActionTarget(null);
    }
  };

  const openCancelModal = (appointment: AppointmentListItem) => {
    setActionError(null);
    setCancelModalTarget(appointment);
    setCancelReason('');
  };

  const closeCancelModal = () => {
    if (actionTarget?.type === 'cancel') return;
    setCancelModalTarget(null);
    setCancelReason('');
  };

  const handleCancelAppointment = async () => {
    if (!cancelModalTarget) return;
    const reason = cancelReason.trim();
    if (!reason) {
      setActionError(isVi ? 'Vui lòng nhập lý do hủy lịch.' : 'Please enter a cancellation reason.');
      return;
    }

    setActionError(null);
    setActionTarget({ id: cancelModalTarget.appointmentId, type: 'cancel' });
    try {
      await cancelAppointmentByStaff(cancelModalTarget.appointmentId, { reason });
      setCancelModalTarget(null);
      setCancelReason('');
      await queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : isVi ? 'Hủy lịch thất bại.' : 'Cancel failed.');
    } finally {
      setActionTarget(null);
    }
  };

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={isVi ? 'Vui lòng đăng nhập để quản lý lịch hẹn.' : 'Please sign in to manage appointments.'}
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
        description={
          isVi ? 'Trang này chỉ dành cho tài khoản bác sĩ.' : 'This page is only available for doctor accounts.'
        }
        action={
          <button
            type="button"
            className="text-sm font-semibold text-blue-600 underline"
            onClick={() => navigate(ROUTES.home)}
          >
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </button>
        }
      />
    );
  }

  if (doctorMeQuery.isLoading || appointmentsQuery.isLoading) {
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
            ? 'Tài khoản này chưa được gắn với hồ sơ bác sĩ trong hệ thống.'
            : 'This account is not linked to a doctor profile yet.'
        }
      />
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
  const total = appointmentsQuery.data?.data.total ?? 0;
  const limit = appointmentsQuery.data?.data.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="mx-auto w-full max-w-[1360px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <header className="mb-4">
          <h1 className="text-3xl font-black text-slate-900">
            {isVi ? 'Quản lý đặt lịch bác sĩ' : 'Doctor appointment management'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {isVi
              ? 'Xem và theo dõi lịch hẹn của bệnh nhân theo thời gian thực.'
              : 'View and track your patient appointments in real time.'}
          </p>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <SelectDateModeParam defaultValue={dayjs().startOf('month')} />
          <SelectParam
            allowClear
            className="w-[170px]"
            placeholder={isVi ? 'Trạng thái' : 'Status'}
            param={SEARCH_PARAMS.STATUS}
            options={DOCTOR_APPOINTMENT_STATUS_OPTIONS.map((option) => ({
              value: option.value,
              label: isVi ? option.labelVi : option.labelEn,
            }))}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {actionError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {actionError}
          </p>
        ) : null}

        <PageCard>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
            <span>
              {isVi ? 'Bác sĩ' : 'Doctor'}: <strong className="text-slate-900">{doctorMeQuery.data.user.name}</strong>
            </span>
            <span>
              {isVi ? 'Tổng lịch hẹn' : 'Total appointments'}: <strong className="text-slate-900">{total}</strong>
            </span>
          </div>
        </PageCard>

        {appointments.length === 0 ? (
          <PageCard>
            <p className="text-sm text-slate-600">
              {isVi ? 'Không có lịch hẹn trong bộ lọc hiện tại.' : 'No appointments found with current filters.'}
            </p>
          </PageCard>
        ) : (
          appointments.map((item) => (
            <PageCard key={item.appointmentId}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <p className="text-lg font-bold text-slate-900">{item.patientName}</p>
                  <p className="text-sm text-slate-600">
                    {item.serviceName} - {formatCurrencyVnd(item.serviceCost)}
                  </p>
                  <p className="text-sm text-slate-600">
                    {formatYmdToDmy(item.appointmentDate)} {item.appointmentTime}
                  </p>
                  {item.patientMedicalHistory ? (
                    <p className="text-sm text-slate-600">
                      {isVi ? 'Tiền sử bệnh: ' : 'Medical history: '}
                      {item.patientMedicalHistory}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2 text-sm">
                  <span className={`rounded-full px-3 py-1 font-semibold ${appointmentStatusBadgeClass(item.status)}`}>
                    {appointmentStatusLabel(item.status, isVi)}
                  </span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                    #{item.appointmentId}
                  </span>
                </div>
              </div>

              {item.status === 'pending' || item.status === 'confirmed' ? (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  {item.status === 'pending' ? (
                    <button
                      type="button"
                      className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-emerald-600 bg-white px-5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!!actionTarget}
                      onClick={() => void handleConfirm(item.appointmentId)}
                    >
                      {actionTarget?.id === item.appointmentId && actionTarget.type === 'confirm'
                        ? isVi
                          ? 'Đang xác nhận...'
                          : 'Confirming...'
                        : isVi
                          ? 'Xác nhận lịch'
                          : 'Confirm appointment'}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-red-200 bg-white px-5 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!!actionTarget}
                    onClick={() => openCancelModal(item)}
                  >
                    {isVi ? 'Hủy lịch' : 'Cancel appointment'}
                  </button>
                </div>
              ) : null}
            </PageCard>
          ))
        )}

        {totalPages > 1 ? (
          <PageCard>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-slate-600">
                {isVi ? 'Trang' : 'Page'} {currentPage} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    const nextPage = currentPage - 1;
                    const params = new URLSearchParams(window.location.search);
                    params.set('page', String(nextPage));
                    if (!fromDate)
                      params.set(SEARCH_PARAMS.FROM_DATE, dayjs().startOf('month').format(DATE_FORMAT.DB_DATE));
                    if (!toDate) params.set(SEARCH_PARAMS.TO_DATE, dayjs().endOf('month').format(DATE_FORMAT.DB_DATE));
                    navigate(`${ROUTES.doctorAppointments}?${params.toString()}`);
                  }}
                >
                  {isVi ? 'Trang trước' : 'Previous'}
                </button>
                <button
                  type="button"
                  className="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    const nextPage = currentPage + 1;
                    const params = new URLSearchParams(window.location.search);
                    params.set('page', String(nextPage));
                    if (!fromDate)
                      params.set(SEARCH_PARAMS.FROM_DATE, dayjs().startOf('month').format(DATE_FORMAT.DB_DATE));
                    if (!toDate) params.set(SEARCH_PARAMS.TO_DATE, dayjs().endOf('month').format(DATE_FORMAT.DB_DATE));
                    navigate(`${ROUTES.doctorAppointments}?${params.toString()}`);
                  }}
                >
                  {isVi ? 'Trang sau' : 'Next'}
                </button>
              </div>
            </div>
          </PageCard>
        ) : null}
      </div>

      {cancelModalTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900">{isVi ? 'Hủy lịch hẹn' : 'Cancel appointment'}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {isVi
                ? `Nhập lý do hủy cho lịch #${cancelModalTarget.appointmentId} (${cancelModalTarget.patientName}).`
                : `Enter cancellation reason for appointment #${cancelModalTarget.appointmentId} (${cancelModalTarget.patientName}).`}
            </p>

            <div className="mt-4">
              <label htmlFor="doctor-cancel-reason" className="mb-2 block text-sm font-semibold text-slate-700">
                {isVi ? 'Lý do hủy' : 'Cancellation reason'}
              </label>
              <textarea
                id="doctor-cancel-reason"
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                rows={4}
                placeholder={
                  isVi
                    ? 'Ví dụ: Bệnh nhân không đến / thay đổi lịch'
                    : 'Example: Patient did not show up / changed schedule'
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                disabled={actionTarget?.type === 'cancel'}
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={closeCancelModal}
                disabled={actionTarget?.type === 'cancel'}
              >
                {isVi ? 'Đóng' : 'Close'}
              </button>
              <button
                type="button"
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => void handleCancelAppointment()}
                disabled={actionTarget?.type === 'cancel'}
              >
                {actionTarget?.type === 'cancel'
                  ? isVi
                    ? 'Đang hủy...'
                    : 'Cancelling...'
                  : isVi
                    ? 'Xác nhận hủy'
                    : 'Confirm cancel'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default QuanLyDatLichBacSiPage;
