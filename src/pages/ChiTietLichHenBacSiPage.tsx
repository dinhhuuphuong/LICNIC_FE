import { PageCard } from '@/components/common/PageCard';
import { StatePanel } from '@/components/common/StatePanel';
import { DoctorAppointmentCancelModal } from '@/components/DoctorAppointmentCancelModal';
import { PatientAppointmentDetailHeader } from '@/components/patient/PatientAppointmentDetailHeader';
import { PatientAppointmentDetailInfoCards } from '@/components/patient/PatientAppointmentDetailInfoCards';
import { PatientAppointmentDetailNotes } from '@/components/patient/PatientAppointmentDetailNotes';
import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  cancelAppointmentByStaff,
  confirmAppointment,
  getAppointmentDetail,
  type AppointmentDetailItem,
} from '@/services/appointmentService';
import { getDoctors } from '@/services/doctorService';
import { useAuthStore } from '@/stores/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

const primaryActionClassName =
  'inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white';

function getDoctorMedicalRecordsManageUrl(detail: AppointmentDetailItem) {
  const searchParams = new URLSearchParams({
    patientId: String(detail.patientId),
    doctorId: String(detail.doctorId),
    appointmentId: String(detail.appointmentId),
    limit: '10',
    page: '1',
    fromAppointmentDetail: '1',
  });
  return `${ROUTES.doctorMedicalRecordsManage}?${searchParams.toString()}`;
}

export function ChiTietLichHenBacSiPage() {
  const { appointmentId: appointmentIdParam } = useParams<{ appointmentId: string }>();
  const appointmentId = Number(appointmentIdParam);
  const validId = Number.isFinite(appointmentId) && appointmentId > 0;
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [actionTarget, setActionTarget] = useState<{ id: number; type: 'confirm' | 'cancel' } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [cancelModalTarget, setCancelModalTarget] = useState<AppointmentDetailItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Chi tiết lịch hẹn' : 'NHA KHOA TẬN TÂM | Appointment detail');

  const doctorMeQuery = useQuery({
    queryKey: ['doctorProfileByUser', user?.userId],
    queryFn: async () => {
      const res = await getDoctors({ page: 1, limit: 1000 });
      return res.data.items.find((item) => item.userId === user?.userId) ?? null;
    },
    enabled: !!user && normalizeRoleName(user.role?.roleName) === ROLE.DOCTOR.toLowerCase(),
  });

  const {
    data: detail,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ['appointments', 'doctor', 'detail', appointmentId] as const,
    queryFn: async () => {
      const res = await getAppointmentDetail(appointmentId);
      return res.data;
    },
    enabled:
      !!user &&
      normalizeRoleName(user.role?.roleName) === ROLE.DOCTOR.toLowerCase() &&
      doctorMeQuery.data != null &&
      validId,
  });

  const doctorIdMismatch =
    detail != null && doctorMeQuery.data != null && String(detail.doctorId) !== String(doctorMeQuery.data.doctorId);

  const handleConfirm = async (targetAppointmentId: number) => {
    setActionError(null);
    setActionTarget({ id: targetAppointmentId, type: 'confirm' });
    try {
      await confirmAppointment(targetAppointmentId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['appointments', 'doctor', 'detail', targetAppointmentId] }),
        queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] }),
      ]);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : isVi ? 'Xác nhận lịch thất bại.' : 'Confirm failed.');
    } finally {
      setActionTarget(null);
    }
  };

  const openCancelModal = (targetDetail: AppointmentDetailItem) => {
    setActionError(null);
    setCancelModalTarget(targetDetail);
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
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['appointments', 'doctor', 'detail', cancelModalTarget.appointmentId],
        }),
        queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] }),
      ]);
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
        description={
          isVi ? 'Vui lòng đăng nhập để xem chi tiết lịch hẹn.' : 'Please sign in to view appointment details.'
        }
        action={
          <button type="button" className={primaryActionClassName} onClick={() => navigate(ROUTES.login)}>
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

  if (!validId) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="rounded-3xl p-8"
        titleClassName="hidden"
        description={isVi ? 'Mã lịch hẹn không hợp lệ.' : 'Invalid appointment id.'}
        descriptionClassName="font-semibold text-slate-800"
        action={
          <Link to={ROUTES.doctorWorkSchedules} className="inline-block text-sm font-bold text-blue-700 underline">
            {isVi ? '← Về lịch làm việc' : '← Back to work schedule'}
          </Link>
        }
      />
    );
  }

  if (doctorMeQuery.isLoading) {
    return (
      <div className="space-y-4 animate-pulse" aria-busy="true">
        <div className="h-12 w-2/3 rounded-lg bg-slate-200" />
        <div className="h-52 rounded-2xl bg-slate-100" />
      </div>
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

  if (doctorIdMismatch) {
    return (
      <StatePanel
        centered
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không có quyền xem lịch hẹn này' : 'Cannot view this appointment'}
        description={
          isVi
            ? 'Lịch hẹn không thuộc bác sĩ đang đăng nhập.'
            : 'This appointment is not assigned to your doctor account.'
        }
        action={
          <Link to={ROUTES.doctorWorkSchedules} className="text-sm font-semibold text-blue-600 underline">
            {isVi ? '← Về lịch làm việc' : '← Back to work schedule'}
          </Link>
        }
      />
    );
  }

  const isCancelling = actionTarget?.type === 'cancel';

  return (
    <div className="mx-auto w-full max-w-[1360px]">
      <div className="mb-6">
        <Link
          to={ROUTES.doctorWorkSchedules}
          className="text-sm font-bold text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-900"
        >
          {isVi ? '← Lịch làm việc' : '← Work schedule'}
        </Link>
      </div>

      {actionError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {actionError}
        </p>
      ) : null}

      {isDetailLoading ? (
        <div className="space-y-4 animate-pulse" aria-busy="true">
          <div className="h-12 w-2/3 rounded-lg bg-slate-200" />
          <div className="h-52 rounded-2xl bg-slate-100" />
        </div>
      ) : isDetailError ? (
        <StatePanel
          tone="danger"
          className="rounded-3xl p-8"
          title={isVi ? 'Không tải được chi tiết lịch hẹn' : 'Could not load appointment detail'}
          description={detailError instanceof Error ? detailError.message : 'Error'}
          action={
            <button
              type="button"
              className="text-sm font-semibold text-red-700 underline"
              onClick={() => void refetchDetail()}
            >
              {isVi ? 'Thử lại' : 'Try again'}
            </button>
          }
        />
      ) : detail ? (
        <>
          <PatientAppointmentDetailHeader
            detail={detail}
            isVi={isVi}
            headerActions={
              detail.status === 'pending' || detail.status === 'confirmed' || detail.status === 'checked_in' ? (
                <>
                  {detail.status === 'pending' ? (
                    <button
                      type="button"
                      className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-emerald-600 bg-white px-5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!!actionTarget}
                      onClick={() => void handleConfirm(detail.appointmentId)}
                    >
                      {actionTarget?.id === detail.appointmentId && actionTarget.type === 'confirm'
                        ? isVi
                          ? 'Đang xác nhận...'
                          : 'Confirming...'
                        : isVi
                          ? 'Xác nhận lịch'
                          : 'Confirm appointment'}
                    </button>
                  ) : null}

                  {detail.status === 'pending' || detail.status === 'confirmed' ? (
                    <button
                      type="button"
                      className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-red-200 bg-white px-5 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!!actionTarget}
                      onClick={() => openCancelModal(detail)}
                    >
                      {isVi ? 'Hủy lịch' : 'Cancel appointment'}
                    </button>
                  ) : null}

                  {detail.status === 'checked_in' ? (
                    <button
                      type="button"
                      className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-violet-600 bg-white px-5 text-sm font-bold text-violet-700 transition hover:bg-violet-50"
                      onClick={() => navigate(getDoctorMedicalRecordsManageUrl(detail))}
                    >
                      {isVi ? 'Quản lý hồ sơ bệnh nhân' : 'Manage patient medical records'}
                    </button>
                  ) : null}
                </>
              ) : null
            }
          />

          <PageCard className="mt-6">
            <h2 className="text-lg font-bold text-slate-900">{isVi ? 'Bệnh nhân' : 'Patient'}</h2>
            <dl className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-start justify-between gap-4">
                <dt className="font-semibold text-slate-500">{isVi ? 'Họ tên' : 'Name'}</dt>
                <dd className="text-right font-medium text-slate-900">{detail.patientName}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="font-semibold text-slate-500">{isVi ? 'Tiền sử bệnh' : 'Medical history'}</dt>
                <dd className="max-w-[min(100%,24rem)] text-right">{detail.patientMedicalHistory || '—'}</dd>
              </div>
            </dl>
          </PageCard>

          <div className="mt-6">
            <PatientAppointmentDetailInfoCards detail={detail} isVi={isVi} />
          </div>

          {detail.status === 'cancelled' && detail.cancelledBy ? (
            <PageCard tone="muted" className="mt-6">
              <h2 className="text-lg font-bold text-slate-900">{isVi ? 'Thông tin hủy' : 'Cancellation'}</h2>
              <p className="mt-3 text-sm text-slate-700">
                <span className="font-semibold text-slate-600">{isVi ? 'Hủy bởi: ' : 'Cancelled by: '}</span>
                {detail.cancelledBy}
              </p>
            </PageCard>
          ) : null}

          <PatientAppointmentDetailNotes detail={detail} isVi={isVi} />
        </>
      ) : null}

      {cancelModalTarget ? (
        <DoctorAppointmentCancelModal
          isVi={isVi}
          cancelModalTarget={cancelModalTarget}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          isSubmitting={isCancelling}
          onClose={closeCancelModal}
          onSubmit={() => void handleCancelAppointment()}
        />
      ) : null}
    </div>
  );
}
