import { getPatientMedicalRecordDetailRoute } from '@/constants/routes';
import type { MedicalRecord } from '@/services/medicalRecordService';
import { Link } from 'react-router-dom';

type PatientMedicalRecordCardProps = {
  record: MedicalRecord;
  isVi: boolean;
};

function formatDateLabel(iso: string | undefined, isVi: boolean): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(isVi ? 'vi-VN' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return iso;
  }
}

export function PatientMedicalRecordCard({ record, isVi }: PatientMedicalRecordCardProps) {
  const doctorName = record.doctor?.user?.name?.trim() || (isVi ? 'Bác sĩ' : 'Doctor');
  const visitDate = formatDateLabel(record.appointment?.appointmentDate ?? record.createdAt, isVi);
  const visitTime =
    record.appointment?.appointmentTime && record.appointment.appointmentTime.length >= 5
      ? record.appointment.appointmentTime.slice(0, 5)
      : null;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            {isVi ? 'Ngày khám' : 'Visit date'}
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {visitDate}
            {visitTime ? (
              <span className="ml-2 text-base font-semibold text-slate-600">
                {isVi ? 'lúc' : 'at'} {visitTime}
              </span>
            ) : null}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {isVi ? 'Bác sĩ:' : 'Doctor:'} <span className="font-semibold text-slate-800">{doctorName}</span>
          </p>
        </div>
        <Link
          to={getPatientMedicalRecordDetailRoute(record.recordId)}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
        >
          {isVi ? 'Chi tiết →' : 'Details →'}
        </Link>
      </div>
      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase text-slate-500">{isVi ? 'Chẩn đoán' : 'Diagnosis'}</p>
        <p className="mt-1 line-clamp-2 text-sm text-slate-800">{record.diagnosis}</p>
      </div>
    </article>
  );
}
