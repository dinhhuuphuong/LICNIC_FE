import { PageCard } from '@/components/common/PageCard';
import { appointmentStatusLabel } from '@/components/patient/patientAppointments.shared';
import type { AppointmentDetailItem } from '@/services/appointmentService';
import { formatYmdToDmy } from '@/utils/dateDisplay';

type PatientAppointmentDetailInfoCardsProps = {
  detail: AppointmentDetailItem;
  isVi: boolean;
};

function formatVnd(n: number): string {
  try {
    return new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
  } catch {
    return `${n} ₫`;
  }
}

function formatDateTime(value: string | null | undefined, isVi: boolean): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return new Intl.DateTimeFormat(isVi ? 'vi-VN' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function PatientAppointmentDetailInfoCards({ detail, isVi }: PatientAppointmentDetailInfoCardsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <PageCard>
        <h2 className="text-lg font-bold text-slate-900">{isVi ? 'Thông tin lịch hẹn' : 'Appointment info'}</h2>
        <dl className="mt-4 space-y-2 text-sm text-slate-700">
          <div className="flex items-start justify-between gap-4">
            <dt className="font-semibold text-slate-500">{isVi ? 'Ngày hẹn' : 'Date'}</dt>
            <dd>{formatYmdToDmy(detail.appointmentDate)}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="font-semibold text-slate-500">{isVi ? 'Giờ hẹn' : 'Time'}</dt>
            <dd>{detail.appointmentTime.slice(0, 5)}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="font-semibold text-slate-500">{isVi ? 'Trạng thái' : 'Status'}</dt>
            <dd>{appointmentStatusLabel(detail.status, isVi)}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="font-semibold text-slate-500">{isVi ? 'Chi phí dịch vụ' : 'Service fee'}</dt>
            <dd>{formatVnd(detail.serviceCost)}</dd>
          </div>
        </dl>
      </PageCard>

      <PageCard tone="success">
        <h2 className="text-lg font-bold text-slate-900">{isVi ? 'Thông tin bổ sung' : 'Additional info'}</h2>
        <dl className="mt-4 space-y-2 text-sm text-slate-700">
          <div className="flex items-start justify-between gap-4">
            <dt className="font-semibold text-slate-500">{isVi ? 'Tạo lúc' : 'Created at'}</dt>
            <dd>{formatDateTime(detail.createdAt, isVi)}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="font-semibold text-slate-500">{isVi ? 'Xác nhận lúc' : 'Responded at'}</dt>
            <dd>{formatDateTime(detail.respondedAt, isVi)}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="font-semibold text-slate-500">{isVi ? 'Check-in lúc' : 'Checked in at'}</dt>
            <dd>{formatDateTime(detail.checkedInAt, isVi)}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="font-semibold text-slate-500">{isVi ? 'Cập nhật lúc' : 'Updated at'}</dt>
            <dd>{formatDateTime(detail.updatedAt, isVi)}</dd>
          </div>
        </dl>
      </PageCard>
    </div>
  );
}
