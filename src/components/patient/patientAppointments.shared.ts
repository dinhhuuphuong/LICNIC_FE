import type { AppointmentListItem } from '@/services/appointmentService';

export function appointmentDoctorIdAsNumber(item: AppointmentListItem): number {
  const n = Number(item.doctorId);
  return Number.isFinite(n) ? n : 0;
}

export function canPatientRescheduleOrCancel(status: string): boolean {
  return status === 'pending' || status === 'confirmed';
}

export function appointmentStatusLabel(status: string, isVi: boolean): string {
  const m: Record<string, [string, string]> = {
    pending: ['Chờ xác nhận', 'Pending'],
    confirmed: ['Đã xác nhận', 'Confirmed'],
    completed: ['Đã khám xong', 'Completed'],
    cancelled: ['Đã hủy', 'Cancelled'],
    checked_in: ['Đã check-in', 'Checked in'],
  };
  const pair = m[status];
  if (!pair) return status;
  return isVi ? pair[0] : pair[1];
}
