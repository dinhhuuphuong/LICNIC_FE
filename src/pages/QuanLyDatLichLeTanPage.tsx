import { PageCard } from '@/components/common/PageCard';
import { StatePanel } from '@/components/common/StatePanel';
import { ReceptionistAppointmentCard } from '@/components/ReceptionistAppointmentCard';
import { ReceptionistAppointmentFilters } from '@/components/ReceptionistAppointmentFilters';
import { ReceptionistAppointmentHeader } from '@/components/ReceptionistAppointmentHeader';
import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import { SEARCH_PARAMS } from '@/constants/search-params';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  cancelAppointmentByStaff,
  checkInAppointment,
  confirmAppointment,
  getAppointments,
  type AppointmentListItem,
} from '@/services/appointmentService';
import { createNotificationBestEffort } from '@/services/notificationService';
import { getPatientProfile } from '@/services/patientService';
import { useAuthStore } from '@/stores/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryParam } from 'use-query-params';

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

export function QuanLyDatLichLeTanPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [statusFilter] = useQueryParam<string | undefined>('status');
  const [fromDate] = useQueryParam<string | undefined>(SEARCH_PARAMS.FROM_DATE);
  const [toDate] = useQueryParam<string | undefined>(SEARCH_PARAMS.TO_DATE);
  const [actionTarget, setActionTarget] = useState<{ id: number; type: 'confirm' | 'checkin' | 'reject' } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Quản lý đặt lịch' : 'NHA KHOA TAN TAM | Appointment management');

  const appointmentsQuery = useQuery({
    queryKey: ['receptionistAppointments', statusFilter || 'all', fromDate || 'all', toDate || 'all'],
    queryFn: () =>
      getAppointments({
        page: 1,
        limit: 200,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {}),
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
        description={
          isVi ? 'Trang này chỉ dành cho tài khoản lễ tân.' : 'This page is only available for receptionist accounts.'
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
    const reason = window.prompt(
      isVi ? 'Nhập lý do từ chối lịch (có thể để trống):' : 'Enter cancellation reason (optional):',
    );
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
      <div className="flex gap-4 justify-between items-center">
        <ReceptionistAppointmentHeader isVi={isVi} />
        <ReceptionistAppointmentFilters isVi={isVi} />
      </div>

      <div className="grid gap-4">
        {actionError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {actionError}
          </p>
        ) : null}

        {appointments.length === 0 ? (
          <PageCard>
            <p className="text-sm text-slate-600">{isVi ? 'Hiện chưa có lịch hẹn nào.' : 'No appointments found.'}</p>
          </PageCard>
        ) : (
          appointments.map((item) => (
            <ReceptionistAppointmentCard
              key={item.appointmentId}
              item={item}
              isVi={isVi}
              actionTarget={actionTarget}
              onConfirm={(appointment) => void handleConfirm(appointment)}
              onCheckIn={(appointmentId) => void handleCheckIn(appointmentId)}
              onReject={(appointment) => void handleReject(appointment)}
            />
          ))
        )}
      </div>
    </div>
  );
}
