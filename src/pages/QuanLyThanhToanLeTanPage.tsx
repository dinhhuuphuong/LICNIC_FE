import { PageCard } from '@/components/common/PageCard';
import SelectParam from '@/components/common/selects/select-param';
import { StatePanel } from '@/components/common/StatePanel';
import ROLE from '@/constants/role';
import { ROUTES, getReceptionistPaymentDetailRoute } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getReceptionistPayments, type PaymentEntity } from '@/services/paymentService';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { Alert, Pagination, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

function getPaymentMethodLabel(method?: string, isVi?: boolean) {
  const normalized = method?.trim().toLowerCase();
  if (normalized === 'cash') return isVi ? 'Tiền mặt' : 'Cash';
  if (normalized === 'bank') return isVi ? 'Ngân hàng' : 'Bank transfer';
  if (normalized === 'online') return isVi ? 'Trực tuyến' : 'Online';
  return method || '—';
}

function getPaymentStatusDisplay(status?: string, isVi?: boolean) {
  const normalized = status?.trim().toLowerCase();
  if (normalized === 'paid') return { label: isVi ? 'Đã thanh toán' : 'Paid', color: 'success' as const };
  if (normalized === 'pending') return { label: isVi ? 'Chờ thanh toán' : 'Pending', color: 'processing' as const };
  if (normalized === 'failed') return { label: isVi ? 'Thất bại' : 'Failed', color: 'error' as const };
  if (normalized === 'cancelled' || normalized === 'canceled')
    return { label: isVi ? 'Đã hủy' : 'Cancelled', color: 'default' as const };
  return { label: status || '—', color: 'default' as const };
}

function formatCurrency(amount?: number | null, isVi?: boolean) {
  if (amount === null || amount === undefined) return '—';
  return `${amount.toLocaleString(isVi ? 'vi-VN' : 'en-GB')} VND`;
}

function formatDateTime(value?: string | null, isVi?: boolean) {
  if (!value) return '—';
  return new Date(value).toLocaleString(isVi ? 'vi-VN' : 'en-GB');
}

export function QuanLyThanhToanLeTanPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [query, setQuery] = useQueryParams({
    paymentStatus: StringParam,
    page: NumberParam,
    limit: NumberParam,
  });

  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? query.limit : 10;
  const paymentStatus =
    query.paymentStatus && ['pending', 'paid', 'failed', 'cancelled'].includes(query.paymentStatus)
      ? (query.paymentStatus as 'pending' | 'paid' | 'failed' | 'cancelled')
      : undefined;

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Quản lý thanh toán' : 'NHA KHOA TAN TAM | Payment management');

  const paymentsQuery = useQuery({
    queryKey: ['receptionistPayments', paymentStatus ?? 'all', page, limit],
    queryFn: () =>
      getReceptionistPayments({
        page,
        limit,
        ...(paymentStatus ? { paymentStatus } : {}),
      }),
    enabled: !!user && normalizeRoleName(user.role?.roleName) === ROLE.RECEPTIONIST.toLowerCase(),
  });

  const columns = useMemo<ColumnsType<PaymentEntity>>(
    () => [
      {
        title: isVi ? 'Mã thanh toán' : 'Payment ID',
        dataIndex: 'paymentId',
        key: 'paymentId',
        width: 120,
        render: (value: number) => <span className="font-semibold text-slate-700">#{value}</span>,
      },
      {
        title: isVi ? 'Mã lịch hẹn' : 'Appointment ID',
        dataIndex: 'appointmentId',
        key: 'appointmentId',
        width: 120,
      },
      {
        title: isVi ? 'Số tiền' : 'Amount',
        key: 'amount',
        width: 180,
        render: (_, record) => formatCurrency(record.amount ?? record.baseAmount, isVi),
      },
      {
        title: isVi ? 'Phương thức' : 'Method',
        dataIndex: 'paymentMethod',
        key: 'paymentMethod',
        width: 140,
        render: (value: string) => getPaymentMethodLabel(value, isVi),
      },
      {
        title: isVi ? 'Trạng thái' : 'Status',
        dataIndex: 'paymentStatus',
        key: 'paymentStatus',
        width: 150,
        render: (value: string) => {
          const status = getPaymentStatusDisplay(value, isVi);
          return <Tag color={status.color}>{status.label}</Tag>;
        },
      },
      {
        title: isVi ? 'Thời gian tạo' : 'Created at',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 190,
        render: (value: string) => formatDateTime(value, isVi),
      },
      {
        title: isVi ? 'Thao tác' : 'Action',
        key: 'action',
        width: 140,
        render: (_, record) => (
          <Link
            className="font-medium text-blue-600 hover:underline"
            to={getReceptionistPaymentDetailRoute(record.paymentId)}
          >
            {isVi ? 'Xem chi tiết' : 'View details'}
          </Link>
        ),
      },
    ],
    [isVi],
  );

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={isVi ? 'Vui lòng đăng nhập để quản lý thanh toán.' : 'Please sign in to manage payments.'}
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
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
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

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <header className="mb-2">
          <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Quản lý thanh toán' : 'Payment management'}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {isVi ? 'Danh sách thanh toán theo lịch hẹn của khách hàng.' : 'List of customer payments by appointment.'}
          </p>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <SelectParam
            allowClear
            className="w-[170px]"
            placeholder={isVi ? 'Trạng thái' : 'Status'}
            param="paymentStatus"
            clearParams={['page']}
            options={[
              { value: 'pending', label: isVi ? 'Chờ thanh toán' : 'Pending' },
              { value: 'paid', label: isVi ? 'Đã thanh toán' : 'Paid' },
            ]}
          />
        </div>
      </div>

      {paymentsQuery.isError ? (
        <Alert
          type="error"
          showIcon
          message={
            paymentsQuery.error instanceof Error
              ? paymentsQuery.error.message
              : isVi
                ? 'Tải danh sách thất bại.'
                : 'Load failed.'
          }
        />
      ) : null}

      <PageCard>
        <Table<PaymentEntity>
          rowKey="paymentId"
          loading={paymentsQuery.isLoading}
          columns={columns}
          dataSource={paymentsQuery.data?.data.items ?? []}
          pagination={false}
          locale={{
            emptyText: isVi ? 'Chưa có thanh toán phù hợp.' : 'No payments found.',
          }}
          scroll={{ x: 1040 }}
        />
        <div className="mt-4 flex justify-end">
          <Pagination
            current={paymentsQuery.data?.data.page ?? page}
            pageSize={paymentsQuery.data?.data.limit ?? limit}
            total={paymentsQuery.data?.data.total ?? 0}
            onChange={(nextPage, nextLimit) => {
              void setQuery({
                paymentStatus,
                page: nextPage,
                limit: nextLimit,
              });
            }}
            showSizeChanger
            pageSizeOptions={['10', '20', '50']}
            showTotal={(totalValue, [from, to]) =>
              isVi ? `${from}-${to} / ${totalValue} thanh toán` : `${from}-${to} of ${totalValue} payments`
            }
          />
        </div>
      </PageCard>
    </div>
  );
}
