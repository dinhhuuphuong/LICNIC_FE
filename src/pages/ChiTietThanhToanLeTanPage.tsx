import { PageCard } from '@/components/common/PageCard';
import { StatePanel } from '@/components/common/StatePanel';
import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  completeReceptionistPayment,
  getReceptionistPaymentDetail,
  getReceptionistPaymentDiscounts,
  type ApplicablePaymentDiscount,
} from '@/services/paymentService';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/utils/cn';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Flex, Select, Tag, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
  if (normalized === 'paid') {
    return { label: isVi ? 'Đã thanh toán' : 'Paid', color: 'success' as const };
  }
  if (normalized === 'pending') {
    return { label: isVi ? 'Chờ thanh toán' : 'Pending', color: 'processing' as const };
  }
  if (normalized === 'failed') {
    return { label: isVi ? 'Thất bại' : 'Failed', color: 'error' as const };
  }
  if (normalized === 'cancelled' || normalized === 'canceled') {
    return { label: isVi ? 'Đã hủy' : 'Cancelled', color: 'default' as const };
  }
  return { label: status || '—', color: 'default' as const };
}

function formatCurrency(amount?: number | null, isVi?: boolean) {
  if (amount === null || amount === undefined) return '—';
  return `${amount.toLocaleString(isVi ? 'vi-VN' : 'en-GB')} ${isVi ? 'VND' : 'VND'}`;
}

function formatDateTime(value?: string | null, isVi?: boolean) {
  if (!value) return '—';
  return new Date(value).toLocaleString(isVi ? 'vi-VN' : 'en-GB');
}

function InfoRow({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3',
        className,
      )}
    >
      <Typography.Text type="secondary">{label}</Typography.Text>
      <Typography.Text strong className="text-right text-slate-800">
        {value}
      </Typography.Text>
    </div>
  );
}

export function ChiTietThanhToanLeTanPage() {
  const { paymentId: paymentIdParam } = useParams<{ paymentId: string }>();
  const paymentId = Number(paymentIdParam);
  const validPaymentId = Number.isInteger(paymentId) && paymentId > 0;
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(null);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Chi tiết thanh toán' : 'NHA KHOA TAN TAM | Payment detail');

  const {
    data: payment,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['payments', 'detail', paymentId] as const,
    queryFn: async () => {
      const response = await getReceptionistPaymentDetail(paymentId);
      return response.data;
    },
    enabled: !!user && normalizeRoleName(user.role?.roleName) === ROLE.RECEPTIONIST.toLowerCase() && validPaymentId,
  });

  const isCompletedPayment = payment?.paymentStatus?.trim().toLowerCase() === 'paid';

  const { data: discountOptions = [], isLoading: isDiscountLoading } = useQuery({
    queryKey: ['payments', paymentId, 'payment-discounts'] as const,
    queryFn: async () => {
      const response = await getReceptionistPaymentDiscounts(paymentId);
      return response.data;
    },
    enabled: !!payment && !!user && validPaymentId,
  });

  useEffect(() => {
    if (!payment) return;
    const appliedId = payment.paymentDiscountId ?? payment.appliedDiscountId ?? null;
    setSelectedDiscountId(appliedId);
  }, [payment]);

  const selectedDiscount = useMemo(
    () => discountOptions.find((item) => item.discountId === selectedDiscountId),
    [discountOptions, selectedDiscountId],
  );

  const previewDiscountAmount = useMemo(() => {
    if (!selectedDiscount) return payment?.discountAmount ?? 0;
    return selectedDiscount.bestDiscountAmount ?? 0;
  }, [selectedDiscount, payment?.discountAmount]);

  const previewTotalAmount = useMemo(() => {
    if (!payment?.baseAmount && !payment?.amount) return null;
    const base = payment.baseAmount ?? payment.amount ?? 0;
    return Math.max(base - previewDiscountAmount, 0);
  }, [payment?.amount, payment?.baseAmount, previewDiscountAmount]);

  const discountSelectOptions = useMemo(
    () =>
      discountOptions.map((item: ApplicablePaymentDiscount) => {
        const discountText =
          item.discountType === 'percent'
            ? `${item.discountValue}%`
            : formatCurrency(item.discountValue, isVi).replace(' VND', '');
        const bestDiscount = item.bestDiscountAmount ? formatCurrency(item.bestDiscountAmount, isVi) : '—';
        return {
          value: item.discountId,
          label: `${item.name} (${discountText}) - ${isVi ? 'Giảm' : 'Save'} ${bestDiscount}`,
        };
      }),
    [discountOptions, isVi],
  );

  const completePaymentMutation = useMutation({
    mutationFn: async () => {
      if (!payment) {
        throw new Error(isVi ? 'Không tìm thấy thông tin thanh toán.' : 'Payment detail is unavailable.');
      }

      const response = await completeReceptionistPayment(payment.paymentId, {
        paymentDiscountId: selectedDiscountId,
      });
      return response.data;
    },
    onSuccess: async () => {
      message.success(isVi ? 'Thanh toán thành công.' : 'Payment completed successfully.');
      await queryClient.invalidateQueries({
        queryKey: ['payments', 'detail', paymentId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['payments', paymentId, 'payment-discounts'],
      });
    },
    onError: (mutationError) => {
      message.error(
        mutationError instanceof Error
          ? mutationError.message
          : isVi
            ? 'Thanh toán thất bại.'
            : 'Failed to complete payment.',
      );
    },
  });

  const isPaid = payment?.paymentStatus?.trim().toLowerCase() === 'paid';

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[760px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={isVi ? 'Vui lòng đăng nhập để xem thanh toán.' : 'Please sign in to view payment details.'}
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

  if (!validPaymentId) {
    return (
      <Alert
        type="warning"
        showIcon
        message={isVi ? 'paymentId không hợp lệ trên URL.' : 'Invalid paymentId in URL.'}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[920px] space-y-4">
      <PageCard className="bg-linear-to-r from-indigo-50 via-white to-cyan-50">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {isVi ? 'Chi tiết thanh toán' : 'Payment detail'}
            </Typography.Title>
            <Typography.Text type="secondary">
              {isVi ? 'Theo dõi trạng thái và thông tin giao dịch' : 'Track payment status and transaction details'}
            </Typography.Text>
          </div>
          <Tag color="blue" className="w-fit rounded-full px-3 py-1 text-sm font-semibold">
            #{paymentId}
          </Tag>
        </div>
      </PageCard>

      {isLoading ? (
        <PageCard>
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-44 rounded bg-slate-200" />
            <div className="h-14 rounded-xl bg-slate-100" />
            <div className="h-14 rounded-xl bg-slate-100" />
            <div className="h-14 rounded-xl bg-slate-100" />
          </div>
        </PageCard>
      ) : null}

      {isError ? (
        <Alert
          type="error"
          showIcon
          message={error instanceof Error ? error.message : isVi ? 'Tải chi tiết thất bại.' : 'Load failed.'}
          action={
            <Button size="small" onClick={() => void refetch()}>
              {isVi ? 'Thử lại' : 'Retry'}
            </Button>
          }
        />
      ) : null}

      {payment ? (
        <div className="grid gap-4">
          <PageCard className="grid gap-4 grid-cols-2">
            <Typography.Title level={5} style={{ margin: 0 }} className="col-span-2">
              {isVi ? 'Thông tin lịch hẹn' : 'Appointment information'}
            </Typography.Title>
            <InfoRow label={isVi ? 'Mã lịch hẹn' : 'Appointment ID'} value={payment.appointmentId} />
            <InfoRow label={isVi ? 'Thời gian tạo' : 'Created at'} value={formatDateTime(payment.createdAt, isVi)} />
            <InfoRow
              className="col-span-2 flex-col items-start"
              label={isVi ? 'Ghi chú' : 'Note'}
              value={payment.note || '—'}
            />
          </PageCard>

          <PageCard className="grid gap-4 grid-cols-3">
            <div className="flex items-center justify-between col-span-3">
              <Typography.Title level={5} style={{ margin: 0 }}>
                {isVi ? 'Thông tin thanh toán' : 'Payment information'}
              </Typography.Title>
              <Tag color={getPaymentStatusDisplay(payment.paymentStatus, isVi).color}>
                {getPaymentStatusDisplay(payment.paymentStatus, isVi).label}
              </Tag>
            </div>
            <InfoRow label={isVi ? 'Mã thanh toán' : 'Payment ID'} value={payment.paymentId} />
            <InfoRow
              label={isVi ? 'Tổng gốc' : 'Base amount'}
              value={formatCurrency(payment.baseAmount ?? payment.amount, isVi)}
            />
            <InfoRow
              label={isVi ? 'Giảm giá' : 'Discount'}
              value={formatCurrency(payment.discountAmount ?? previewDiscountAmount, isVi)}
            />
            <InfoRow
              label={isVi ? 'Thành tiền' : 'Final amount'}
              value={formatCurrency(
                Math.max(
                  (payment.baseAmount ?? payment.amount ?? 0) - (payment.discountAmount ?? previewDiscountAmount),
                  0,
                ),
                isVi,
              )}
            />
            <InfoRow
              label={isVi ? 'Phương thức thanh toán' : 'Payment method'}
              value={getPaymentMethodLabel(payment.paymentMethod, isVi)}
            />
          </PageCard>

          {isCompletedPayment || (
            <PageCard className="space-y-3">
              <Typography.Title level={5} style={{ margin: 0 }}>
                {isVi ? 'Áp dụng giảm giá' : 'Apply discount'}
              </Typography.Title>
              <Select
                className="w-full"
                placeholder={isVi ? 'Chọn mã giảm giá phù hợp' : 'Choose a discount'}
                loading={isDiscountLoading}
                allowClear
                value={selectedDiscountId ?? undefined}
                onChange={(value) => setSelectedDiscountId((value as number | undefined) ?? null)}
                options={discountSelectOptions}
                notFoundContent={isVi ? 'Không có mã giảm giá phù hợp' : 'No applicable discounts'}
              />
              <InfoRow
                label={isVi ? 'Ước tính sau giảm' : 'Estimated after discount'}
                value={previewTotalAmount !== null ? formatCurrency(previewTotalAmount, isVi) : '—'}
              />
            </PageCard>
          )}
        </div>
      ) : null}

      <PageCard className="py-4">
        <Flex justify="space-between">
          <Button onClick={() => navigate(ROUTES.receptionistAppointments)}>
            {isVi ? 'Về danh sách lịch hẹn' : 'Back to appointments'}
          </Button>
          {payment ? (
            <Button
              type="primary"
              loading={completePaymentMutation.isPending}
              disabled={isPaid}
              onClick={() => completePaymentMutation.mutate()}
            >
              {isPaid ? (isVi ? 'Đã thanh toán' : 'Paid') : isVi ? 'Thanh toán' : 'Complete payment'}
            </Button>
          ) : null}
        </Flex>
      </PageCard>
    </div>
  );
}
