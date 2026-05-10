import type { AppointmentDetailItem } from '@/services/appointmentService';
import type { ReactNode } from 'react';

type PatientAppointmentDetailHeaderProps = {
  detail: AppointmentDetailItem;
  isVi: boolean;
  /** Nút / nhóm hành động căn phải trên desktop (ví dụ bác sĩ: quản lý hồ sơ). */
  headerActions?: ReactNode;
};

export function PatientAppointmentDetailHeader({ detail, isVi, headerActions }: PatientAppointmentDetailHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1">
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
      </div>
      {headerActions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{headerActions}</div>
      ) : null}
    </header>
  );
}
