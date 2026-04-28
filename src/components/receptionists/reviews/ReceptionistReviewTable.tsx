import { ReceptionistReviewActions } from '@/components/receptionists/reviews/ReceptionistReviewActions';
import { getReceptionistReviewDetailRoute } from '@/constants/routes';
import type { AppointmentReviewItem } from '@/services/reviewService';
import { approveReview, rejectReview } from '@/services/reviewService';
import { Pagination, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

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

type ReceptionistReviewTableProps = {
  isVi: boolean;
  loading: boolean;
  reviews: AppointmentReviewItem[];
  page: number;
  limit: number;
  total: number;
  onChangePage: (nextPage: number, nextLimit: number) => void;
  onReviewUpdated?: () => Promise<unknown> | unknown;
};

export function ReceptionistReviewTable({
  isVi,
  loading,
  reviews,
  page,
  limit,
  total,
  onChangePage,
  onReviewUpdated,
}: ReceptionistReviewTableProps) {
  const navigate = useNavigate();

  const handleApprove = useCallback(
    async (reviewId: number) => {
      await approveReview(reviewId);
      await onReviewUpdated?.();
    },
    [onReviewUpdated],
  );

  const handleReject = useCallback(
    async (reviewId: number, reason: string) => {
      await rejectReview(reviewId, { reason });
      await onReviewUpdated?.();
    },
    [onReviewUpdated],
  );

  const columns = useMemo<ColumnsType<AppointmentReviewItem>>(
    () => [
      {
        title: isVi ? 'ID' : 'ID',
        dataIndex: 'reviewId',
        key: 'reviewId',
        render: (value: number) => <span className="font-semibold text-slate-700">#{value}</span>,
      },
      {
        title: isVi ? 'Bệnh nhân' : 'Patient',
        key: 'patient',
        render: (_, record) => record.patient?.user?.name || '—',
      },
      {
        title: isVi ? 'Bác sĩ' : 'Doctor',
        key: 'doctor',
        render: (_, record) => record.doctor?.user?.name || '—',
      },
      {
        title: isVi ? 'Lịch hẹn' : 'Appointment',
        dataIndex: 'appointmentId',
        key: 'appointmentId',
      },
      {
        title: isVi ? 'Điểm' : 'Rating',
        dataIndex: 'rating',
        key: 'rating',
        render: (value: number) => <span className="font-semibold text-amber-600">{value}/5</span>,
      },
      {
        title: isVi ? 'Nội dung' : 'Comment',
        dataIndex: 'comment',
        key: 'comment',
        render: (value: string | null) => (
          <span className="block max-w-[200px] whitespace-normal wrap-break-word line-clamp-3">
            {value?.trim() || '—'}
          </span>
        ),
      },
      {
        title: isVi ? 'Trạng thái' : 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (value: string) => {
          const status = getReviewStatusDisplay(value, isVi);
          return <Tag color={status.color}>{status.label}</Tag>;
        },
      },
      {
        title: isVi ? 'Tạo lúc' : 'Created at',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value: string) => formatDateTime(value, isVi),
      },
      {
        fixed: 'right',
        title: isVi ? 'Thao tác' : 'Actions',
        key: 'actions',
        render: (_, record) => (
          <ReceptionistReviewActions
            isVi={isVi}
            reviewId={record.reviewId}
            status={record.status}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ),
      },
    ],
    [handleApprove, handleReject, isVi],
  );

  return (
    <>
      <Table<AppointmentReviewItem>
        rowKey="reviewId"
        loading={loading}
        columns={columns}
        dataSource={reviews}
        pagination={false}
        locale={{
          emptyText: isVi ? 'Chưa có đánh giá phù hợp.' : 'No reviews found.',
        }}
        onRow={(record) => ({
          onClick: () => {
            navigate(getReceptionistReviewDetailRoute(record.reviewId));
          },
          className: 'cursor-pointer',
        })}
        scroll={{ x: 'max-content' }}
      />
      <div className="mt-4 flex justify-end">
        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          onChange={onChangePage}
          showSizeChanger
          pageSizeOptions={['10', '20', '50']}
          showTotal={(totalValue, [from, to]) =>
            isVi ? `${from}-${to} / ${totalValue} đánh giá` : `${from}-${to} of ${totalValue} reviews`
          }
        />
      </div>
    </>
  );
}
