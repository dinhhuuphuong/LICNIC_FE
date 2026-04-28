import { StatePanel } from '@/components/common/StatePanel';
import { PatientAppointmentDetailHeader } from '@/components/patient/PatientAppointmentDetailHeader';
import { PatientAppointmentDetailInfoCards } from '@/components/patient/PatientAppointmentDetailInfoCards';
import { PatientAppointmentDetailNotes } from '@/components/patient/PatientAppointmentDetailNotes';
import { PATIENT_ROLE_ID } from '@/constants/roleIds';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getAppointmentDetail } from '@/services/appointmentService';
import { getMyPatientProfile } from '@/services/patientService';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

const patientMeQueryKey = ['patients', 'me'] as const;
const primaryActionClassName =
  'inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white';

export function ChiTietLichHenBenhNhanPage() {
  const { appointmentId: appointmentIdParam } = useParams<{ appointmentId: string }>();
  const appointmentId = Number(appointmentIdParam);
  const validId = Number.isFinite(appointmentId) && appointmentId > 0;
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Chi tiết lịch hẹn' : 'NHA KHOA TẬN TÂM | Appointment detail');

  const { data: patient, isLoading: isPatientLoading } = useQuery({
    queryKey: patientMeQueryKey,
    queryFn: async () => {
      const res = await getMyPatientProfile();
      return res?.data ?? null;
    },
    enabled: !!user && user.roleId === PATIENT_ROLE_ID,
  });

  const {
    data: detail,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ['appointments', 'patient', 'detail', appointmentId] as const,
    queryFn: async () => {
      const res = await getAppointmentDetail(appointmentId);
      return res.data;
    },
    enabled: !!user && user.roleId === PATIENT_ROLE_ID && patient != null && validId,
  });

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

  if (user.roleId !== PATIENT_ROLE_ID) {
    return (
      <StatePanel
        centered
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không có quyền truy cập' : 'Access denied'}
        description={
          isVi ? 'Trang này chỉ dành cho tài khoản bệnh nhân.' : 'This page is only available for patient accounts.'
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
          <Link to={ROUTES.patientAppointments} className="inline-block text-sm font-bold text-blue-700 underline">
            {isVi ? '← Về danh sách lịch hẹn' : '← Back to appointments'}
          </Link>
        }
      />
    );
  }

  if (!isPatientLoading && patient == null) {
    return (
      <StatePanel
        centered
        tone="warning"
        titleClassName="hidden"
        description={isVi ? 'Cần hồ sơ bệnh nhân để xem chi tiết lịch hẹn.' : 'Patient profile required.'}
        action={
          <Link to={ROUTES.patientProfile} className={primaryActionClassName}>
            {isVi ? 'Mở hồ sơ' : 'Open profile'}
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to={ROUTES.patientAppointments}
          className="text-sm font-bold text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-900"
        >
          {isVi ? '← Tất cả lịch hẹn' : '← All appointments'}
        </Link>
      </div>

      {isPatientLoading || isDetailLoading ? (
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
          <PatientAppointmentDetailHeader detail={detail} isVi={isVi} />
          <PatientAppointmentDetailInfoCards detail={detail} isVi={isVi} />
          <PatientAppointmentDetailNotes detail={detail} isVi={isVi} />
        </>
      ) : null}
    </div>
  );
}
