import { PatientAppointmentReviewStars } from '@/components/patient/appointment/review/PatientAppointmentReviewStars';
import type { AppointmentReviewItem } from '@/services/reviewService';
import { Modal } from 'antd';

type PatientAppointmentReviewCardProps = {
  review: AppointmentReviewItem;
  isVi: boolean;
  onDelete: (reviewId: number) => void;
  isDeleting: boolean;
  onStartEdit: (review: AppointmentReviewItem) => void;
  isEditing: boolean;
};

function reviewStatusLabel(status: string, isVi: boolean) {
  if (status === 'approved') return isVi ? 'Đã duyệt' : 'Approved';
  if (status === 'rejected') return isVi ? 'Bị từ chối' : 'Rejected';
  if (status === 'pending') return isVi ? 'Đang chờ duyệt' : 'Pending';
  return status;
}

function reviewStatusClassName(status: string) {
  if (status === 'approved') return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (status === 'rejected') return 'bg-red-50 text-red-700 ring-red-200';
  return 'bg-amber-50 text-amber-700 ring-amber-200';
}

function formatDateTime(value: string, isVi: boolean): string {
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

export function PatientAppointmentReviewCard({
  review,
  isVi,
  onDelete,
  isDeleting,
  onStartEdit,
  isEditing,
}: PatientAppointmentReviewCardProps) {
  const doctorName = review.doctor?.user?.name || (isVi ? 'Bác sĩ' : 'Doctor');
  const patientName = review.patient?.user?.name || (isVi ? 'Bệnh nhân' : 'Patient');
  const handleDelete = () => {
    Modal.confirm({
      title: isVi ? 'Xác nhận xóa đánh giá' : 'Confirm review deletion',
      content: isVi ? 'Bạn có chắc muốn xóa đánh giá này?' : 'Are you sure you want to delete this review?',
      okText: isVi ? 'Xóa' : 'Delete',
      okType: 'danger',
      cancelText: isVi ? 'Hủy' : 'Cancel',
      onOk: () => onDelete(review.reviewId),
    });
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">{patientName}</p>
          <p className="text-xs text-slate-500">
            {isVi ? 'Đánh giá cho:' : 'Reviewed doctor:'} <span className="font-semibold">{doctorName}</span>
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${reviewStatusClassName(review.status)}`}>
          {reviewStatusLabel(review.status, isVi)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <PatientAppointmentReviewStars rating={review.rating} />
        <span className="text-sm font-semibold text-slate-700">{review.rating}/5</span>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
        {review.comment?.trim() || (isVi ? 'Không có nội dung đánh giá.' : 'No review comment.')}
      </p>

      {review.status === 'rejected' && review.rejectionReason?.trim() ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {isVi ? 'Lý do từ chối: ' : 'Rejection reason: '}
          {review.rejectionReason.trim()}
        </p>
      ) : null}

      <p className="mt-3 text-xs text-slate-500">
        {isVi ? 'Tạo lúc:' : 'Created at:'} {formatDateTime(review.createdAt, isVi)}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => onStartEdit(review)}
          disabled={isDeleting}
        >
          {isEditing ? (isVi ? 'Đang chỉnh sửa' : 'Editing') : isVi ? 'Sửa đánh giá' : 'Edit review'}
        </button>
        <button
          type="button"
          className="inline-flex items-center rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (isVi ? 'Đang xóa...' : 'Deleting...') : isVi ? 'Xóa đánh giá' : 'Delete review'}
        </button>
      </div>
    </article>
  );
}
