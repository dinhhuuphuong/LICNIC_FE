import { ROUTES } from '@/constants/routes';
import { Link } from 'react-router-dom';

type DoctorMedicalRecordsHeaderProps = {
  isVi: boolean;
  appointmentId: number;
  patientId: number;
};

export function DoctorMedicalRecordsHeader({ isVi, appointmentId, patientId }: DoctorMedicalRecordsHeaderProps) {
  return (
    <>
      <div>
        <Link to={ROUTES.doctorAppointments} className="text-sm font-semibold text-blue-600 underline">
          {isVi ? '← Quay lại quản lý đặt lịch' : '← Back to appointments'}
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
