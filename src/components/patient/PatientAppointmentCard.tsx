import { appointmentStatusLabel, canPatientRescheduleOrCancel } from '@/components/patient/patientAppointments.shared';
import type { AppointmentListItem } from '@/services/appointmentService';
import { formatYmdToDmy } from '@/utils/dateDisplay';

type PatientAppointmentCardProps = {
  item: AppointmentListItem;
  isVi: boolean;
  onViewDetail: (item: AppointmentListItem) => void;
  onReschedule: (item: AppointmentListItem) => void;
  onCancel: (item: AppointmentListItem) => void;
};

function formatVnd(n: number): string {
  try {
    return new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
  } catch {
    return `${n} ₫`;
  }
}

export function PatientAppointmentCard({
  item,
  isVi,
  onViewDetail,
  onReschedule,
  onCancel,
}: PatientAppointmentCardProps) {
  const timeShort = item.appointmentTime.length >= 5 ? item.appointmentTime.slice(0, 5) : item.appointmentTime;
  const dateLabel = formatYmdToDmy(item.appointmentDate);
  const modifiable = canPatientRescheduleOrCancel(item.status);

  return (
    <article
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
      aria-labelledby={`appt-title-${item.appointmentId}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id={`appt-title-${item.appointmentId}`} className="text-lg font-bold text-slate-900">
            {item.serviceName}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {isVi ? 'Bác sĩ:' : 'Doctor:'} <span className="font-semibold text-slate-800">{item.doctorName}</span>
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
            item.status === 'cancelled'
              ? 'bg-slate-100 text-slate-700'
              : item.status === 'completed'
                ? 'bg-emerald-100 text-emerald-800'
                : item.status === 'confirmed'
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-amber-100 text-amber-900'
          }`}
        >
          {appointmentStatusLabel(item.status, isVi)}
        </span>
      </div>

      <dl className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-slate-500">{isVi ? 'Ngày' : 'Date'}</dt>
          <dd>{dateLabel}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">{isVi ? 'Giờ' : 'Time'}</dt>
          <dd>{timeShort}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">{isVi ? 'Chi phí dịch vụ' : 'Service fee'}</dt>
          <dd>{formatVnd(item.serviceCost)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">{isVi ? 'Mã lịch' : 'Appointment id'}</dt>
          <dd>#{item.appointmentId}</dd>
        </div>
      </dl>

      {item.note?.trim() ? (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <span className="font-semibold text-slate-600">{isVi ? 'Ghi chú: ' : 'Note: '}</span>
          {item.note.trim()}
        </p>
      ) : null}

      {item.status === 'cancelled' && item.cancellationReason?.trim() ? (
        <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-900">
          <span className="font-semibold">{isVi ? 'Lý do hủy: ' : 'Cancellation reason: '}</span>
          {item.cancellationReason.trim()}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-emerald-200 bg-white px-5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
          onClick={() => onViewDetail(item)}
        >
          {isVi ? 'Xem chi tiết' : 'View details'}
        </button>
        {modifiable ? (
          <>
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-blue-700 bg-white px-5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
              onClick={() => onReschedule(item)}
            >
              {isVi ? 'Đổi lịch' : 'Reschedule'}
            </button>
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-red-200 bg-white px-5 text-sm font-bold text-red-700 transition hover:bg-red-50"
              onClick={() => onCancel(item)}
            >
              {isVi ? 'Hủy lịch' : 'Cancel'}
            </button>
          </>
        ) : null}
      </div>
    </article>
  );
}
