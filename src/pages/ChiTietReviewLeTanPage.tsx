import { PageCard } from '@/components/common/PageCard';
import { StatePanel } from '@/components/common/StatePanel';
import { ReceptionistReviewActions } from '@/components/receptionists/reviews';
import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { approveReview, getReviewDetail, rejectReview } from '@/services/reviewService';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Tag, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

function formatDateTime(value?: string | null, isVi?: boolean) {
  if (!value) return '—';
  return new Date(value).toLocaleString(isVi ? 'vi-VN' : 'en-GB');
}

function getReviewStatusDisplay(status?: string, isVi?: boolean) {
  const normalized = status?.trim().toLowerCase();
  if (normalized === 'approved') return { label: isVi ? 'Đã duyệt' : 'Approved', color: 'success' as const };
  if (normalized === 'rejected') return { label: isVi ? 'Từ chối' : 'Rejected', color: 'error' as const };
  if (normalized === 'pending') return { label: isVi ? 'Chờ duyệt' : 'Pending', color: 'processing' as const };
  return { label: status || '—', color: 'default' as const };
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2.5">
      <Typography.Text type="secondary" className="mb-1 block text-xs uppercase tracking-wide">
        {label}
      </Typography.Text>
      <Typography.Text strong className="block wrap-break-word text-sm text-slate-800">
        {value}
      </Typography.Text>
    </div>
  );
}

export function ChiTietReviewLeTanPage() {
  const { reviewId: reviewIdParam } = useParams<{ reviewId: string }>();
  const reviewId = Number(reviewIdParam);
  const validReviewId = Number.isInteger(reviewId) && reviewId > 0;
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Chi tiết review' : 'NHA KHOA TAN TAM | Review detail');

  const reviewQuery = useQuery({
    queryKey: ['receptionistReviews', 'detail', reviewId],
    queryFn: async () => {
      const response = await getReviewDetail(reviewId);
      return response.data;
    },
    enabled: !!user && normalizeRoleName(user.role?.roleName) === ROLE.RECEPTIONIST.toLowerCase() && validReviewId,
  });

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[760px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={isVi ? 'Vui lòng đăng nhập để xem review.' : 'Please sign in to view review detail.'}
        action={
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white"
            onClick={() => navigate(ROUTES.login)}
          >
            {isVi ? 'Đăng nhập' : 'Login'}
          </button>
        }
      />
    );
  }

  if (normalizeRoleName(user.role?.roleName) !== ROLE.RECEPTIONIST.toLowerCase()) {
    return (
      <StatePanel
        centered
        className="mx-auto w-full max-w-[760px] rounded-3xl p-8"
        title={isVi ? 'Không có quyền truy cập' : 'Access denied'}
        description={
          isVi ? 'Trang này chỉ dành cho tài khoản lễ tân.' : 'This page is only available for receptionist accounts.'
        }
        action={
          <button
            type="button"
            className="text-sm font-semibold text-blue-600 underline"
            onClick={() => navigate(ROUTES.home)}
          >
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </button>
        }
      />
    );
  }

  if (!validReviewId) {
    return (
      <Alert type="warning" showIcon message={isVi ? 'reviewId không hợp lệ trên URL.' : 'Invalid reviewId in URL.'} />
    );
  }

  const review = reviewQuery.data;
  const status = getReviewStatusDisplay(review?.status, isVi);

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-3">
      <PageCard className="bg-linear-to-r from-indigo-50 via-white to-cyan-50">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {isVi ? 'Chi tiết review' : 'Review detail'}
            </Typography.Title>
            <Typography.Text type="secondary">
              {isVi ? 'Xem đầy đủ thông tin và duyệt review' : 'Inspect and moderate review details'}
            </Typography.Text>
          </div>
          <div className="flex items-center gap-2">
            <Button size="small" onClick={() => navigate(ROUTES.receptionistReviewsManage)}>
              {isVi ? 'Về danh sách' : 'Back to list'}
            </Button>
            <Tag color="blue" className="w-fit rounded-full px-3 py-1 text-sm font-semibold">
              #{reviewId}
            </Tag>
          </div>
        </div>
      </PageCard>

      {reviewQuery.isLoading ? (
        <PageCard>
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-44 rounded bg-slate-200" />
            <div className="h-14 rounded-xl bg-slate-100" />
            <div className="h-14 rounded-xl bg-slate-100" />
            <div className="h-14 rounded-xl bg-slate-100" />
          </div>
        </PageCard>
      ) : null}

      {reviewQuery.isError ? (
        <Alert
          type="error"
          showIcon
          message={
            reviewQuery.error instanceof Error
              ? reviewQuery.error.message
              : isVi
                ? 'Tải chi tiết thất bại.'
                : 'Load failed.'
          }
          action={
            <Button size="small" onClick={() => void reviewQuery.refetch()}>
              {isVi ? 'Thử lại' : 'Retry'}
            </Button>
          }
        />
      ) : null}

      {review ? (
        <div className="grid gap-3 lg:grid-cols-12">
          <PageCard className="space-y-3 lg:col-span-12">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Typography.Title level={5} style={{ margin: 0 }}>
                {isVi ? 'Trạng thái và duyệt review' : 'Status and moderation'}
              </Typography.Title>
              <div className="flex items-center gap-2">
                <Tag color={status.color}>{status.label}</Tag>
                <ReceptionistReviewActions
                  isVi={isVi}
                  reviewId={review.reviewId}
                  status={review.status}
                  onApprove={async (id) => {
                    await approveReview(id);
                    await reviewQuery.refetch();
                  }}
                  onReject={async (id, reason) => {
                    await rejectReview(id, { reason });
                    await reviewQuery.refetch();
                  }}
                />
              </div>
            </div>
          </PageCard>

          <PageCard className="space-y-3 lg:col-span-8">
            <Typography.Title level={5} style={{ margin: 0 }}>
              {isVi ? 'Nội dung review' : 'Review content'}
            </Typography.Title>
            <div className="grid gap-2 md:grid-cols-2">
              <InfoRow label={isVi ? 'Bệnh nhân' : 'Patient'} value={review.patient?.user?.name || '—'} />
              <InfoRow label={isVi ? 'Bác sĩ' : 'Doctor'} value={review.doctor?.user?.name || '—'} />
              <InfoRow label={isVi ? 'Mã lịch hẹn' : 'Appointment ID'} value={String(review.appointmentId)} />
              <InfoRow label={isVi ? 'Điểm đánh giá' : 'Rating'} value={`${review.rating}/5`} />
              <InfoRow label={isVi ? 'Thời gian tạo' : 'Created at'} value={formatDateTime(review.createdAt, isVi)} />
              <InfoRow
                label={isVi ? 'Cập nhật lần cuối' : 'Updated at'}
                value={formatDateTime(review.updatedAt, isVi)}
              />
              <div className="md:col-span-2">
                <InfoRow label={isVi ? 'Nội dung' : 'Comment'} value={review.comment?.trim() || '—'} />
              </div>
              <div className="md:col-span-2">
                <InfoRow
                  label={isVi ? 'Lý do từ chối' : 'Rejection reason'}
                  value={review.rejectionReason?.trim() || '—'}
                />
              </div>
            </div>
          </PageCard>

          <PageCard className="space-y-3 lg:col-span-4">
            <Typography.Title level={5} style={{ margin: 0 }}>
              {isVi ? 'Lịch hẹn liên quan' : 'Related appointment'}
            </Typography.Title>
            <div className="grid gap-2">
              <InfoRow
                label={isVi ? 'Ngày khám' : 'Appointment date'}
                value={review.appointment?.appointmentDate || '—'}
              />
              <InfoRow
                label={isVi ? 'Giờ khám' : 'Appointment time'}
                value={review.appointment?.appointmentTime || '—'}
              />
              <InfoRow
                label={isVi ? 'Trạng thái lịch hẹn' : 'Appointment status'}
                value={review.appointment?.status || '—'}
              />
              <InfoRow label={isVi ? 'Ghi chú' : 'Note'} value={review.appointment?.note || '—'} />
            </div>
          </PageCard>
        </div>
      ) : null}
    </div>
  );
}
