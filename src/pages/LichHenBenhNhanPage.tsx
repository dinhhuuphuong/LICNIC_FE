import { StatePanel } from '@/components/common/StatePanel';
import { PatientAppointmentCard } from '@/components/patient/PatientAppointmentCard';
import { PatientCancelAppointmentModal } from '@/components/patient/PatientCancelAppointmentModal';
import { PatientRescheduleModal } from '@/components/patient/PatientRescheduleModal';
import { PATIENT_ROLE_ID } from '@/constants/roleIds';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getAppointments, type AppointmentListItem } from '@/services/appointmentService';
import { getMyPatientProfile } from '@/services/patientService';
import { useAuthStore } from '@/stores/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PAGE_SIZE = 8;
const appointmentsQueryKeyRoot = ['appointments', 'patient'] as const;
const patientMeQueryKey = ['patients', 'me'] as const;
const toolbarLinkClassName =
  'inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-bold shadow-sm transition';
const neutralToolbarLinkClassName = `${toolbarLinkClassName} border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-800`;
const successToolbarLinkClassName =
  `${toolbarLinkClassName} border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100`;
const primaryActionClassName =
  'inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white';
const paginationButtonClassName =
  'rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-40';

export function LichHenBenhNhanPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentListItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AppointmentListItem | null>(null);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Lịch hẹn' : 'NHA KHOA TẬN TÂM | Appointments');

  const {
    data: patient,
    isLoading: isPatientLoading,
    isError: isPatientError,
    error: patientError,
    refetch: refetchPatient,
  } = useQuery({
    queryKey: patientMeQueryKey,
    queryFn: async () => {
      const res = await getMyPatientProfile();
      return res?.data ?? null;
    },
    enabled: !!user && user.roleId === PATIENT_ROLE_ID,
  });

  const patientId = patient?.patientId;

  const queryKey = useMemo(
    () => [...appointmentsQueryKeyRoot, patientId, page, statusFilter || 'all'] as const,
    [patientId, page, statusFilter],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await getAppointments({
        patientId: patientId!,
        page,
        limit: PAGE_SIZE,
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      return res.data;
    },
    enabled: !!user && user.roleId === PATIENT_ROLE_ID && patientId != null,
  });

  const invalidateList = () => {
    void queryClient.invalidateQueries({ queryKey: appointmentsQueryKeyRoot });
  };

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={isVi ? 'Vui lòng đăng nhập để xem lịch hẹn của bạn.' : 'Please sign in to view your appointments.'}
        action={
          <button type="button" className={primaryActionClassName} onClick={() => navigate(ROUTES.login)}>
            {isVi ? 'Đăng nhập' : 'Login'}
          </button>
        }
      />
    );
  }

  if (user.roleId !== PATIENT_ROLE_ID) {
    return (
      <StatePanel
        centered
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không có quyền truy cập' : 'Access denied'}
        description={isVi ? 'Trang này chỉ dành cho tài khoản bệnh nhân.' : 'This page is only available for patient accounts.'}
        action={
          <button type="button" className="text-sm font-semibold text-blue-600 underline" onClick={() => navigate(ROUTES.home)}>
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </button>
        }
      />
    );
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const listLoading = isPatientLoading || (patientId != null && (isLoading || isFetching));

  if (isPatientError) {
    return (
      <StatePanel
        tone="danger"
        className="rounded-3xl p-8"
        title={isVi ? 'Không tải được hồ sơ' : 'Could not load profile'}
        description={patientError instanceof Error ? patientError.message : 'Error'}
        action={
          <button type="button" className="text-sm font-semibold text-red-700 underline" onClick={() => void refetchPatient()}>
            {isVi ? 'Thử lại' : 'Try again'}
          </button>
        }
      />
    );
  }

  if (!isPatientLoading && patient == null) {
    return (
      <div>
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Lịch hẹn của tôi' : 'My appointments'}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {isVi
              ? 'Cần có hồ sơ bệnh nhân để xem lịch hẹn theo mã bệnh nhân.'
              : 'You need a patient profile to view appointments by patient id.'}
          </p>
        </header>
        <StatePanel
          centered
          tone="warning"
          titleClassName="hidden"
          description={isVi ? 'Bạn chưa tạo hồ sơ bệnh nhân.' : 'You have not created a patient profile yet.'}
          action={
            <Link to={ROUTES.patientProfile} className={primaryActionClassName}>
              {isVi ? 'Tạo / mở hồ sơ' : 'Create or open profile'}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Lịch hẹn của tôi' : 'My appointments'}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {isVi
              ? 'Xem, đổi giờ hoặc hủy các lịch đang chờ hoặc đã xác nhận.'
              : 'View, reschedule, or cancel pending and confirmed visits.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start">
          <Link
            to={ROUTES.patientProfile}
            className={neutralToolbarLinkClassName}
          >
            {isVi ? '← Hồ sơ bệnh nhân' : '← Patient profile'}
          </Link>
          <Link
            to={ROUTES.patientMedicalRecords}
            className={successToolbarLinkClassName}
          >
            {isVi ? 'Bệnh án →' : 'Records →'}
          </Link>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-slate-700" htmlFor="appt-status-filter">
          {isVi ? 'Trạng thái' : 'Status'}
        </label>
        <select
          id="appt-status-filter"
          className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-600"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{isVi ? 'Tất cả' : 'All'}</option>
          <option value="pending">{isVi ? 'Chờ xác nhận' : 'Pending'}</option>
          <option value="confirmed">{isVi ? 'Đã xác nhận' : 'Confirmed'}</option>
          <option value="completed">{isVi ? 'Đã khám xong' : 'Completed'}</option>
          <option value="cancelled">{isVi ? 'Đã hủy' : 'Cancelled'}</option>
          <option value="checked_in">{isVi ? 'Đã check-in' : 'Checked in'}</option>
        </select>
      </div>

      {listLoading ? (
        <div className="space-y-4" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : isError ? (
        <StatePanel
          tone="danger"
          className="rounded-3xl p-8"
          title={isVi ? 'Không tải được danh sách' : 'Could not load list'}
          description={error instanceof Error ? error.message : 'Error'}
          action={
            <button type="button" className="text-sm font-semibold text-red-700 underline" onClick={() => void refetch()}>
              {isVi ? 'Thử lại' : 'Try again'}
            </button>
          }
        />
      ) : !data?.items.length ? (
        <StatePanel
          centered
          tone="muted"
          className="p-12"
          description={isVi ? 'Bạn chưa có lịch hẹn nào.' : 'You have no appointments yet.'}
          descriptionClassName="text-slate-700"
        >
          <p className="mt-2 text-sm text-slate-500">
            {isVi ? 'Đặt lịch từ trang dịch vụ để bắt đầu.' : 'Book from a service page to get started.'}
          </p>
        </StatePanel>
      ) : (
        <>
          <ul className="space-y-4">
            {data.items.map((item) => (
              <li key={item.appointmentId}>
                <PatientAppointmentCard
                  item={item}
                  isVi={isVi}
                  onReschedule={setRescheduleTarget}
                  onCancel={setCancelTarget}
                />
              </li>
            ))}
          </ul>

          {totalPages > 1 ? (
            <nav
              className="mt-8 flex flex-wrap items-center justify-center gap-2"
              aria-label={isVi ? 'Phân trang' : 'Pagination'}
            >
              <button
                type="button"
                className={paginationButtonClassName}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {isVi ? 'Trước' : 'Prev'}
              </button>
              <span className="px-2 text-sm text-slate-600">
                {isVi ? 'Trang' : 'Page'} {page} / {totalPages}
              </span>
              <button
                type="button"
                className={paginationButtonClassName}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                {isVi ? 'Sau' : 'Next'}
              </button>
            </nav>
          ) : null}
        </>
      )}

      <PatientRescheduleModal
        open={!!rescheduleTarget}
        appointment={rescheduleTarget}
        isVi={isVi}
        onClose={() => setRescheduleTarget(null)}
        onSuccess={invalidateList}
      />
      <PatientCancelAppointmentModal
        open={!!cancelTarget}
        appointment={cancelTarget}
        isVi={isVi}
        onClose={() => setCancelTarget(null)}
        onSuccess={invalidateList}
      />
    </div>
  );
}
