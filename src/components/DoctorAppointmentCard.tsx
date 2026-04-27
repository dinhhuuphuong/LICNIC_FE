import { AppointmentStatusBadge, type AppointmentStatus } from '@/components/AppointmentStatusBadge';
import { PageCard } from '@/components/common/PageCard';
import type { AppointmentListItem } from '@/services/appointmentService';
import { formatYmdToDmy } from '@/utils/dateDisplay';

type DoctorAppointmentCardProps = {
  item: AppointmentListItem;
  isVi: boolean;
  isActionDisabled: boolean;
  isConfirming: boolean;
  onConfirm: (appointmentId: number) => void;
  onOpenCancelModal: (appointment: AppointmentListItem) => void;
  onManageMedicalRecords: (appointment: AppointmentListItem) => void;
  onCreateMedicalRecord: (appointmentId: number) => void;
};

function formatCurrencyVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

export function DoctorAppointmentCard({
  item,
  isVi,
  isActionDisabled,
  isConfirming,
  onConfirm,
  onOpenCancelModal,
  onManageMedicalRecords,
  onCreateMedicalRecord,
}: DoctorAppointmentCardProps) {
  return (
    <PageCard>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-bold text-slate-900">{item.patientName}</p>
          <p className="text-sm text-slate-600">
            {item.serviceName} - {formatCurrencyVnd(item.serviceCost)}
          </p>
          <p className="text-sm text-slate-600">
            {formatYmdToDmy(item.appointmentDate)} {item.appointmentTime}
          </p>
          {item.patientMedicalHistory ? (
            <p className="text-sm text-slate-600">
              {isVi ? 'Tiền sử bệnh: ' : 'Medical history: '}
              {item.patientMedicalHistory}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <AppointmentStatusBadge status={item.status as AppointmentStatus} isVi={isVi} />
          <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">#{item.appointmentId}</span>
        </div>
      </div>

      {item.status === 'pending' || item.status === 'confirmed' ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {item.status === 'pending' ? (
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-emerald-600 bg-white px-5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isActionDisabled}
              onClick={() => onConfirm(item.appointmentId)}
            >
              {isConfirming
                ? isVi
                  ? 'Đang xác nhận...'
                  : 'Confirming...'
                : isVi
                  ? 'Xác nhận lịch'
                  : 'Confirm appointment'}
            </button>
          ) : null}

          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-red-200 bg-white px-5 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isActionDisabled}
            onClick={() => onOpenCancelModal(item)}
          >
            {isVi ? 'Hủy lịch' : 'Cancel appointment'}
          </button>
        </div>
      ) : null}

      {item.status === 'checked_in' ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-violet-600 bg-white px-5 text-sm font-bold text-violet-700 transition hover:bg-violet-50"
            onClick={() => onManageMedicalRecords(item)}
          >
            {isVi ? 'Quản lý hồ sơ bệnh nhân' : 'Manage patient medical records'}
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-blue-600 bg-white px-5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            onClick={() => onCreateMedicalRecord(item.appointmentId)}
          >
            {isVi ? 'Tạo hồ sơ bệnh án' : 'Create medical record'}
          </button>
        </div>
      ) : null}
    </PageCard>
  );
}
