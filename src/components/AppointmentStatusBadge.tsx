export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'checked_in';

const APPOINTMENT_STATUS_STYLE: Record<AppointmentStatus, { vi: string; en: string; className: string }> = {
  pending: {
    vi: 'Chờ xác nhận',
    en: 'Pending',
    className: 'bg-amber-50 text-amber-700',
  },
  confirmed: {
    vi: 'Đã xác nhận',
    en: 'Confirmed',
    className: 'bg-blue-50 text-blue-700',
  },
  checked_in: {
    vi: 'Đã check-in',
    en: 'Checked in',
    className: 'bg-cyan-50 text-cyan-700',
  },
  completed: {
    vi: 'Đã hoàn tất',
    en: 'Completed',
    className: 'bg-emerald-50 text-emerald-700',
  },
  cancelled: {
    vi: 'Đã hủy',
    en: 'Cancelled',
    className: 'bg-rose-50 text-rose-700',
  },
};

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus;
  isVi: boolean;
};

export function AppointmentStatusBadge({ status, isVi }: AppointmentStatusBadgeProps) {
  const statusMeta = APPOINTMENT_STATUS_STYLE[status];
  return (
    <span className={`rounded-full px-3 py-1 font-semibold ${statusMeta.className}`}>
      {isVi ? statusMeta.vi : statusMeta.en}
    </span>
  );
}
