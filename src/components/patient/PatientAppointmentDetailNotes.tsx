import { PageCard } from '@/components/common/PageCard';
import type { AppointmentDetailItem } from '@/services/appointmentService';

type PatientAppointmentDetailNotesProps = {
  detail: AppointmentDetailItem;
  isVi: boolean;
};

export function PatientAppointmentDetailNotes({ detail, isVi }: PatientAppointmentDetailNotesProps) {
  return (
    <>
      {detail.note?.trim() ? (
        <PageCard className="mt-6">
          <h2 className="text-lg font-bold text-slate-900">{isVi ? 'Ghi chú' : 'Note'}</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{detail.note.trim()}</p>
        </PageCard>
      ) : null}

      {detail.status === 'cancelled' && detail.cancellationReason?.trim() ? (
        <PageCard tone="danger" className="mt-6">
          <h2 className="text-lg font-bold text-red-900">{isVi ? 'Thông tin hủy lịch' : 'Cancellation info'}</h2>
          <p className="mt-3 text-sm text-red-800">
            <span className="font-semibold">{isVi ? 'Lý do: ' : 'Reason: '}</span>
            {detail.cancellationReason.trim()}
          </p>
        </PageCard>
      ) : null}
    </>
  );
}
