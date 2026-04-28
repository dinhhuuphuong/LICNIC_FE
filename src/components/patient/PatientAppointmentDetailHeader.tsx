import type { AppointmentDetailItem } from '@/services/appointmentService';

type PatientAppointmentDetailHeaderProps = {
  detail: AppointmentDetailItem;
  isVi: boolean;
};

export function PatientAppointmentDetailHeader({ detail, isVi }: PatientAppointmentDetailHeaderProps) {
  return (
    <header className="mb-8 border-b border-slate-200 pb-6">
      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
        {isVi ? 'Chi tiết lịch hẹn' : 'Appointment detail'}
      </p>
      <h1 className="mt-2 text-3xl font-black text-slate-900">{detail.serviceName}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {isVi ? 'Bác sĩ phụ trách:' : 'Doctor:'}{' '}
        <span className="font-semibold text-slate-800">{detail.doctorName}</span>
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {isVi ? 'Mã lịch hẹn:' : 'Appointment id:'} <span className="font-mono">#{detail.appointmentId}</span>
      </p>
    </header>
  );
}
