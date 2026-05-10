import { ROUTES, getDoctorAppointmentDetailRoute } from '@/constants/routes';
import { Link } from 'react-router-dom';

type DoctorMedicalRecordsHeaderProps = {
  isVi: boolean;
  appointmentId: number;
  patientId: number;
  /** Mở từ trang chi tiết lịch hẹn bác sĩ — nút quay lại dẫn về chi tiết lịch đó. */
  fromAppointmentDetail?: boolean;
};

export function DoctorMedicalRecordsHeader({
  isVi,
  appointmentId,
  patientId,
  fromAppointmentDetail = false,
}: DoctorMedicalRecordsHeaderProps) {
  const backHref = fromAppointmentDetail ? getDoctorAppointmentDetailRoute(appointmentId) : ROUTES.doctorAppointments;
  const backLabelVi = fromAppointmentDetail ? '← Quay lại chi tiết lịch hẹn' : '← Quay lại quản lý đặt lịch';
  const backLabelEn = fromAppointmentDetail ? '← Back to appointment detail' : '← Back to appointments';

  return (
    <>
      <div>
        <Link to={backHref} className="text-sm font-semibold text-blue-600 underline">
          {isVi ? backLabelVi : backLabelEn}
        </Link>
      </div>

      <header>
        <h1 className="text-3xl font-black text-slate-900">
          {isVi ? 'Quản lý hồ sơ bệnh nhân' : 'Manage patient medical records'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {isVi ? 'Kết quả lọc theo lịch hẹn #' : 'Filtered by appointment #'}
          <span className="font-bold text-slate-900">{appointmentId}</span>
          {' · '}
          {isVi ? 'Bệnh nhân #' : 'Patient #'}
          <span className="font-bold text-slate-900">{patientId}</span>
        </p>
      </header>
    </>
  );
}
