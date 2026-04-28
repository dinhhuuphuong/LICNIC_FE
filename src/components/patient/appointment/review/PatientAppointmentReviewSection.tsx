import { PageCard } from '@/components/common/PageCard';
import { PatientAppointmentReviewCard } from '@/components/patient/appointment/review/PatientAppointmentReviewCard';
import { PatientAppointmentReviewForm } from '@/components/patient/appointment/review/PatientAppointmentReviewForm';
import type { AppointmentReviewItem } from '@/services/reviewService';
import { useState } from 'react';

type PatientAppointmentReviewSectionProps = {
  appointmentId: number;
  reviews: AppointmentReviewItem[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  onCreateReview: (payload: { rating: number; comment: string }) => Promise<unknown>;
  isCreatingReview: boolean;
  onUpdateReview: (reviewId: number, payload: { rating: number; comment: string }) => Promise<unknown>;
  isUpdatingReview: boolean;
  onDeleteReview: (reviewId: number) => void;
  deletingReviewId: number | null;
  isVi: boolean;
};

export function PatientAppointmentReviewSection({
  appointmentId,
  reviews,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onCreateReview,
  isCreatingReview,
  onUpdateReview,
  isUpdatingReview,
  onDeleteReview,
  deletingReviewId,
  isVi,
}: PatientAppointmentReviewSectionProps) {
  const [editingReview, setEditingReview] = useState<AppointmentReviewItem | null>(null);
  const hasCurrentReview = reviews.some((review) => review.appointmentId === appointmentId);

  return (
    <PageCard className="mt-6">
      <h2 className="text-lg font-bold text-slate-900">{isVi ? 'Đánh giá của bạn' : 'Your review'}</h2>

      {!isLoading && !isError && !hasCurrentReview ? (
        <PatientAppointmentReviewForm isVi={isVi} isSubmitting={isCreatingReview} onSubmitReview={onCreateReview} />
      ) : null}

      {(hasCurrentReview &&
        (isLoading ? (
          <div className="mt-4 space-y-3 animate-pulse" aria-busy="true">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-24 rounded-xl bg-slate-100" />
          </div>
        ) : isError ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {errorMessage || (isVi ? 'Không tải được đánh giá.' : 'Could not load review.')}
            </p>
            <button type="button" className="mt-2 text-sm font-semibold text-red-700 underline" onClick={onRetry}>
              {isVi ? 'Thử lại' : 'Try again'}
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            {isVi ? 'Bạn chưa có đánh giá cho lịch hẹn này.' : 'You have not reviewed this appointment yet.'}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {editingReview ? (
              <PatientAppointmentReviewForm
                isVi={isVi}
                submitLabel={isVi ? 'Cập nhật đánh giá' : 'Update review'}
                isSubmitting={isUpdatingReview}
                initialValues={{
                  rating: editingReview.rating,
                  comment: editingReview.comment ?? '',
                }}
                onSubmitReview={async (payload) => {
                  await onUpdateReview(editingReview.reviewId, payload);
                  setEditingReview(null);
                }}
                onCancel={() => setEditingReview(null)}
              />
            ) : null}
            {reviews.map((review) => (
              <PatientAppointmentReviewCard
                key={review.reviewId}
                review={review}
                isVi={isVi}
                onStartEdit={(item) => setEditingReview(item)}
                isEditing={editingReview?.reviewId === review.reviewId}
                onDelete={onDeleteReview}
                isDeleting={deletingReviewId === review.reviewId}
              />
            ))}
          </div>
        ))) ||
        null}
    </PageCard>
  );
}
