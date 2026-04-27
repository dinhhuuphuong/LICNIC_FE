import { AppointmentStatusBadge, type AppointmentStatus } from '@/components/AppointmentStatusBadge';
import { ReceptionistCreatePaymentModal } from '@/components/ReceptionistCreatePaymentModal';
import { PageCard } from '@/components/common/PageCard';
import type { AppointmentListItem } from '@/services/appointmentService';
import { formatYmdToDmy } from '@/utils/dateDisplay';
import { useState } from 'react';

type ActionType = 'confirm' | 'checkin' | 'reject';

type ReceptionistAppointmentCardProps = {
  item: AppointmentListItem;
  isVi: boolean;
  actionTarget: { id: number; type: ActionType } | null;
  onConfirm: (appointment: AppointmentListItem) => void;
  onCheckIn: (appointmentId: number) => void;
  onReject: (appointment: AppointmentListItem) => void;
};

export function ReceptionistAppointmentCard({
  item,
  isVi,
  actionTarget,
  onConfirm,
  onCheckIn,
  onReject,
}: ReceptionistAppointmentCardProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const canConfirm = item.status === 'pending';
  const canCheckIn = item.status === 'confirmed';
  const canReject = item.status === 'pending' || item.status === 'confirmed';
  const canPay = item.status === 'completed';
  const isActingCurrent = actionTarget?.id === item.appointmentId;
  const isActionDisabled = !!actionTarget;

  return (
    <>
      <PageCard>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-lg font-bold text-slate-900">{item.patientName}</p>
            <p className="text-sm text-slate-600">
              {item.serviceName} - {item.doctorName}
            </p>
            <p className="text-sm text-slate-600">
              {formatYmdToDmy(item.appointmentDate)} {item.appointmentTime}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <AppointmentStatusBadge status={item.status as AppointmentStatus} isVi={isVi} />
            <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">#{item.appointmentId}</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {canConfirm ? (
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-emerald-600 bg-white px-5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => onConfirm(item)}
              disabled={isActionDisabled}
            >
              {isActingCurrent && actionTarget?.type === 'confirm'
                ? isVi
                  ? 'Đang xác nhận...'
                  : 'Confirming...'
                : isVi
                  ? 'Chấp nhận'
                  : 'Accept'}
            </button>
          ) : null}

          {canCheckIn ? (
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-blue-700 bg-white px-5 text-sm font-bold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => onCheckIn(item.appointmentId)}
              disabled={isActionDisabled}
            >
              {isActingCurrent && actionTarget?.type === 'checkin'
                ? isVi
                  ? 'Đang check-in...'
                  : 'Checking in...'
                : isVi
                  ? 'Check-in'
                  : 'Check in'}
            </button>
          ) : null}

          {canReject ? (
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-red-200 bg-white px-5 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => onReject(item)}
              disabled={isActionDisabled}
            >
              {isActingCurrent && actionTarget?.type === 'reject'
                ? isVi
                  ? 'Đang từ chối...'
                  : 'Rejecting...'
                : isVi
                  ? 'Từ chối'
                  : 'Reject'}
            </button>
          ) : null}

          {canPay ? (
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-violet-600 bg-white px-5 text-sm font-bold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setIsPaymentModalOpen(true)}
              disabled={isActionDisabled}
            >
              {isVi ? 'Thanh toán' : 'Pay'}
            </button>
          ) : null}
        </div>
      </PageCard>

      <ReceptionistCreatePaymentModal
        appointmentId={item.appointmentId}
        isVi={isVi}
        open={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </>
  );
}
