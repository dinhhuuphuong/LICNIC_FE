import { DoctorAppointmentCancelModal } from '@/components/DoctorAppointmentCancelModal';
import { DoctorAppointmentCard } from '@/components/DoctorAppointmentCard';
import { DoctorAppointmentFilters } from '@/components/DoctorAppointmentFilters';
import { DoctorAppointmentPagination } from '@/components/DoctorAppointmentPagination';
import { DoctorAppointmentSummaryCard } from '@/components/DoctorAppointmentSummaryCard';
import { PageCard } from '@/components/common/PageCard';
import { StatePanel } from '@/components/common/StatePanel';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryParam } from 'use-query-params';

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

function getDoctorMedicalRecordManageRoute(item: AppointmentListItem) {
  const searchParams = new URLSearchParams({
    patientId: String(item.patientId),
    doctorId: String(item.doctorId),
    appointmentId: String(item.appointmentId),
    limit: '10',
    page: '1',
  });
  return `${ROUTES.doctorMedicalRecordsManage}?${searchParams.toString()}`;
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
  const isCancelling = actionTarget?.type === 'cancel';

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

        <DoctorAppointmentFilters isVi={isVi} />
      </div>

      <div className="grid gap-4">
        {actionError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {actionError}
          </p>
        ) : null}

        <DoctorAppointmentSummaryCard isVi={isVi} doctorName={doctorMeQuery.data.user.name} total={total} />

        {appointments.length === 0 ? (
          <PageCard>
            <p className="text-sm text-slate-600">
              {isVi ? 'Không có lịch hẹn trong bộ lọc hiện tại.' : 'No appointments found with current filters.'}
            </p>
          </PageCard>
        ) : (
          appointments.map((item) => (
            <DoctorAppointmentCard
              key={item.appointmentId}
              item={item}
              isVi={isVi}
              isActionDisabled={!!actionTarget}
              isConfirming={actionTarget?.id === item.appointmentId && actionTarget.type === 'confirm'}
              onConfirm={(appointmentId) => void handleConfirm(appointmentId)}
              onOpenCancelModal={openCancelModal}
              onManageMedicalRecords={(appointment) => navigate(getDoctorMedicalRecordManageRoute(appointment))}
              onCreateMedicalRecord={(appointmentId) =>
                navigate(`${ROUTES.doctorMedicalRecordCreate}?appointmentId=${appointmentId}`)
              }
            />
          ))
        )}

        {totalPages > 1 ? (
          <PageCard>
            <DoctorAppointmentPagination
              isVi={isVi}
              currentPage={currentPage}
              totalPages={totalPages}
              fromDate={fromDate}
              toDate={toDate}
              onNavigate={(url) => navigate(url)}
            />
          </PageCard>
        ) : null}
      </div>

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
};

export default QuanLyDatLichBacSiPage;
