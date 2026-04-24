import { PageCard } from '@/components/common/PageCard';
import { StatePanel } from '@/components/common/StatePanel';
import { appointmentStatusLabel } from '@/components/patient/patientAppointments.shared';
import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cancelAppointmentByStaff, checkInAppointment, confirmAppointment, getAppointments, type AppointmentListItem } from '@/services/appointmentService';
import { createNotificationBestEffort } from '@/services/notificationService';
import { getPatientProfile } from '@/services/patientService';
import { useAuthStore } from '@/stores/authStore';
import { formatYmdToDmy } from '@/utils/dateDisplay';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

export function QuanLyDatLichLeTanPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [actionTarget, setActionTarget] = useState<{ id: number; type: 'confirm' | 'checkin' | 'reject' } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Quản lý đặt lịch' : 'NHA KHOA TAN TAM | Appointment management');

  const appointmentsQuery = useQuery({
    queryKey: ['receptionistAppointments', statusFilter || 'all'],
    queryFn: () =>
      getAppointments({
        page: 1,
        limit: 200,
        ...(statusFilter ? { status: statusFilter } : {}),
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

  const sendDecisionNotification = async (appointment: AppointmentListItem, decision: 'confirmed' | 'cancelled') => {
    let userId: number | undefined;
    try {
      const patientRes = await getPatientProfile(appointment.patientId);
      userId = patientRes.data.userId;
    } catch {
      // Best effort only; fallback payload is sent below.
    }

    const title = decision === 'confirmed' ? 'Lich hen da duoc xac nhan' : 'Lich hen da bi tu choi';
    const content =
      decision === 'confirmed'
        ? `Lich hen #${appointment.appointmentId} da duoc le tan xac nhan.`
        : `Lich hen #${appointment.appointmentId} da bi le tan tu choi.`;
    const type = decision === 'confirmed' ? 'appointment_confirmed' : 'appointment_cancelled';

    const okByUser = await createNotificationBestEffort({
      userId: userId ?? appointment.patientId,
      title,
      content,
      type,
      redirectUrl: ROUTES.patientAppointments,
    });
    if (okByUser) return true;

    return createNotificationBestEffort({
      patientId: appointment.patientId,
      title,
      content,
      type,
      redirectUrl: ROUTES.patientAppointments,
    });
  };

  const handleConfirm = async (appointment: AppointmentListItem) => {
    setActionError(null);
    setActionTarget({ id: appointment.appointmentId, type: 'confirm' });
    try {
      await confirmAppointment(appointment.appointmentId);
      await sendDecisionNotification(appointment, 'confirmed');
      await queryClient.invalidateQueries({ queryKey: ['receptionistAppointments'] });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : isVi ? 'Xác nhận lịch thất bại.' : 'Confirm failed.');
    } finally {
      setActionTarget(null);
    }
  };

  const handleCheckIn = async (appointmentId: number) => {
    setActionError(null);
    setActionTarget({ id: appointmentId, type: 'checkin' });
    try {
      await checkInAppointment(appointmentId);
      await queryClient.invalidateQueries({ queryKey: ['receptionistAppointments'] });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : isVi ? 'Check-in thất bại.' : 'Check-in failed.');
    } finally {
      setActionTarget(null);
    }
  };

  const handleReject = async (appointment: AppointmentListItem) => {
    const reason = window.prompt(isVi ? 'Nhập lý do từ chối lịch (có thể để trống):' : 'Enter cancellation reason (optional):');
    if (reason === null) return;

    setActionError(null);
    setActionTarget({ id: appointment.appointmentId, type: 'reject' });
    try {
      await cancelAppointmentByStaff(appointment.appointmentId, reason.trim() ? { reason: reason.trim() } : {});
      await sendDecisionNotification(appointment, 'cancelled');
      await queryClient.invalidateQueries({ queryKey: ['receptionistAppointments'] });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : isVi ? 'Từ chối lịch thất bại.' : 'Reject failed.');
    } finally {
      setActionTarget(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1360px]">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Quản lý đặt lịch' : 'Appointment management'}</h1>
        <p className="mt-2 text-sm text-slate-600">{isVi ? 'Danh sách lịch khách hàng đã đặt.' : 'List of customer appointments.'}</p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-slate-700" htmlFor="receptionist-appt-status-filter">
          {isVi ? 'Trạng thái' : 'Status'}
        </label>
        <select
          id="receptionist-appt-status-filter"
          className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-600"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">{isVi ? 'Tất cả' : 'All'}</option>
          <option value="pending">{isVi ? 'Chờ xác nhận' : 'Pending'}</option>
          <option value="confirmed">{isVi ? 'Đã xác nhận' : 'Confirmed'}</option>
          <option value="completed">{isVi ? 'Đã khám xong' : 'Completed'}</option>
          <option value="cancelled">{isVi ? 'Đã hủy' : 'Cancelled'}</option>
          <option value="checked_in">{isVi ? 'Đã check-in' : 'Checked in'}</option>
        </select>
      </div>

      <div className="grid gap-4">
        {actionError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{actionError}</p>
        ) : null}

        {appointments.length === 0 ? (
          <PageCard>
            <p className="text-sm text-slate-600">{isVi ? 'Hiện chưa có lịch hẹn nào.' : 'No appointments found.'}</p>
          </PageCard>
        ) : (
          appointments.map((item) => {
            const canConfirm = item.status === 'pending';
            const canCheckIn = item.status === 'confirmed';
            const canReject = item.status === 'pending' || item.status === 'confirmed';
            const isActingCurrent = actionTarget?.id === item.appointmentId;

            return (
              <PageCard key={item.appointmentId}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-slate-900">{item.patientName}</p>
                    <p className="text-sm text-slate-600">
                      {item.serviceName} - {item.doctorName}
                    </p>
                    <p className="text-sm text-slate-600">
                      {formatYmdToDmy(item.appointmentDate)} {item.appointmentTime}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                      {isVi ? 'Trạng thái:' : 'Status:'} {appointmentStatusLabel(item.status, isVi)}
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">#{item.appointmentId}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  {canConfirm ? (
                    <button
                      type="button"
                      className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-emerald-600 bg-white px-5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => void handleConfirm(item)}
                      disabled={!!actionTarget}
                    >
                      {isActingCurrent && actionTarget?.type === 'confirm' ? (isVi ? 'Đang xác nhận...' : 'Confirming...') : isVi ? 'Chấp nhận' : 'Accept'}
                    </button>
                  ) : null}

                  {canCheckIn ? (
                    <button
                      type="button"
                      className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-blue-700 bg-white px-5 text-sm font-bold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => void handleCheckIn(item.appointmentId)}
                      disabled={!!actionTarget}
                    >
                      {isActingCurrent && actionTarget?.type === 'checkin' ? (isVi ? 'Đang check-in...' : 'Checking in...') : isVi ? 'Check-in' : 'Check in'}
                    </button>
                  ) : null}

                  {canReject ? (
                    <button
                      type="button"
                      className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-red-200 bg-white px-5 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => void handleReject(item)}
                      disabled={!!actionTarget}
                    >
                      {isActingCurrent && actionTarget?.type === 'reject' ? (isVi ? 'Đang từ chối...' : 'Rejecting...') : isVi ? 'Từ chối' : 'Reject'}
                    </button>
                  ) : null}
                </div>
              </PageCard>
            );
          })
        )}
      </div>
    </div>
  );
}
