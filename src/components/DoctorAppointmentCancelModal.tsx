import type { AppointmentListItem } from '@/services/appointmentService';

type DoctorAppointmentCancelModalProps = {
  isVi: boolean;
  cancelModalTarget: AppointmentListItem;
  cancelReason: string;
  setCancelReason: (value: string) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export function DoctorAppointmentCancelModal({
  isVi,
  cancelModalTarget,
  cancelReason,
  setCancelReason,
  isSubmitting,
  onClose,
  onSubmit,
}: DoctorAppointmentCancelModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900">{isVi ? 'Hủy lịch hẹn' : 'Cancel appointment'}</h2>
        <p className="mt-2 text-sm text-slate-600">
          {isVi
            ? `Nhập lý do hủy cho lịch #${cancelModalTarget.appointmentId} (${cancelModalTarget.patientName}).`
            : `Enter cancellation reason for appointment #${cancelModalTarget.appointmentId} (${cancelModalTarget.patientName}).`}
        </p>

        <div className="mt-4">
          <label htmlFor="doctor-cancel-reason" className="mb-2 block text-sm font-semibold text-slate-700">
            {isVi ? 'Lý do hủy' : 'Cancellation reason'}
          </label>
          <textarea
            id="doctor-cancel-reason"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            rows={4}
            placeholder={
              isVi
                ? 'Ví dụ: Bệnh nhân không đến / thay đổi lịch'
                : 'Example: Patient did not show up / changed schedule'
            }
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            disabled={isSubmitting}
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {isVi ? 'Đóng' : 'Close'}
          </button>
          <button
            type="button"
            className="rounded-full bg-red-600 px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (isVi ? 'Đang hủy...' : 'Cancelling...') : isVi ? 'Xác nhận hủy' : 'Confirm cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
