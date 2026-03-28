import { cancelAppointment, type AppointmentListItem } from '@/services/appointmentService';
import { useEffect, useState } from 'react';

type PatientCancelAppointmentModalProps = {
  open: boolean;
  onClose: () => void;
  appointment: AppointmentListItem | null;
  isVi: boolean;
  onSuccess: () => void;
};

export function PatientCancelAppointmentModal({
  open,
  onClose,
  appointment,
  isVi,
  onSuccess,
}: PatientCancelAppointmentModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason('');
      setError(null);
    }
  }, [open, appointment?.appointmentId]);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open || !appointment) return null;

  const titleId = 'cancel-appt-dialog-title';

  const handleConfirm = async () => {
    setError(null);
    try {
      setSubmitting(true);
      await cancelAppointment(appointment.appointmentId, {
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : isVi ? 'Hủy lịch thất bại.' : 'Cancel failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 grid place-items-center bg-slate-900/55 px-4 py-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className="text-xl font-black text-slate-900">
          {isVi ? 'Hủy lịch hẹn?' : 'Cancel this appointment?'}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {appointment.serviceName} · {appointment.appointmentDate}{' '}
          {appointment.appointmentTime.length >= 5
            ? appointment.appointmentTime.slice(0, 5)
            : appointment.appointmentTime}
        </p>
        <label className="mt-4 block text-sm font-semibold text-slate-700" htmlFor="cancel-reason">
          {isVi ? 'Lý do hủy (tùy chọn)' : 'Reason (optional)'}
        </label>
        <textarea
          id="cancel-reason"
          rows={3}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-600"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {error ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            {isVi ? 'Quay lại' : 'Go back'}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleConfirm()}
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {submitting ? (isVi ? 'Đang hủy...' : 'Cancelling...') : isVi ? 'Xác nhận hủy' : 'Confirm cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
