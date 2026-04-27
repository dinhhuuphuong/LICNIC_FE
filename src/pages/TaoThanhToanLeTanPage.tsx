import { StatePanel } from '@/components/common/StatePanel';
import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { createReceptionistPaymentFromAppointment } from '@/services/paymentService';
import { useAuthStore } from '@/stores/authStore';
import { Alert, Button, Card, Form, Input, Select, Space, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

type PaymentFormValues = {
  paymentMethod: 'cash' | 'bank' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled';
  transactionId: string;
  invoiceNumber: string;
  paidAt: Dayjs | null;
  note: string;
  paymentDiscountId: number | null;
};

export function TaoThanhToanLeTanPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();
  const appointmentIdRaw = searchParams.get('appointmentId');
  const appointmentId = Number(appointmentIdRaw);
  const hasValidAppointmentId = Number.isInteger(appointmentId) && appointmentId > 0;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form] = Form.useForm<PaymentFormValues>();

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Tạo thanh toán' : 'NHA KHOA TAN TAM | Create payment');

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[760px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={isVi ? 'Vui lòng đăng nhập để tạo thanh toán.' : 'Please sign in to create payments.'}
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

  const handleSubmit = async (values: PaymentFormValues) => {
    if (!hasValidAppointmentId) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      await createReceptionistPaymentFromAppointment({
        appointmentId,
        paymentMethod: values.paymentMethod,
        paymentStatus: values.paymentStatus,
        ...(values.transactionId?.trim() ? { transactionId: values.transactionId.trim() } : {}),
        ...(values.invoiceNumber?.trim() ? { invoiceNumber: values.invoiceNumber.trim() } : {}),
        ...(values.paidAt ? { paidAt: values.paidAt.toISOString() } : {}),
        ...(values.note?.trim() ? { note: values.note.trim() } : {}),
        ...(values.paymentDiscountId ? { paymentDiscountId: values.paymentDiscountId } : {}),
      });
      setSuccessMessage(isVi ? 'Tạo thanh toán thành công.' : 'Payment created successfully.');
      form.resetFields(['transactionId', 'invoiceNumber', 'paidAt', 'note', 'paymentDiscountId']);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : isVi ? 'Tạo thanh toán thất bại.' : 'Create payment failed.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[760px]">
      <Card>
        <Space direction="vertical" size={16} className="w-full">
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {isVi ? 'Tạo thanh toán' : 'Create payment'}
            </Typography.Title>
            <Typography.Text type="secondary">
              {isVi ? 'Tạo thanh toán từ lịch hẹn #' : 'Create payment from appointment #'}
              {hasValidAppointmentId ? appointmentId : 'N/A'}
            </Typography.Text>
          </div>

          {!hasValidAppointmentId ? (
            <Alert
              type="warning"
              showIcon
              message={isVi ? 'Thiếu appointmentId hợp lệ trên URL.' : 'Missing valid appointmentId in URL.'}
            />
          ) : null}

          {errorMessage ? <Alert type="error" showIcon message={errorMessage} /> : null}
          {successMessage ? <Alert type="success" showIcon message={successMessage} /> : null}

          <Form<PaymentFormValues>
            form={form}
            layout="vertical"
            disabled={isSubmitting || !hasValidAppointmentId}
            initialValues={{
              paymentMethod: 'cash',
              paymentStatus: 'pending',
              transactionId: '',
              invoiceNumber: '',
              paidAt: null,
              note: '',
              paymentDiscountId: null,
            }}
            onFinish={handleSubmit}
          >
            <Form.Item
              name="paymentMethod"
              label={isVi ? 'Phương thức thanh toán' : 'Payment method'}
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: 'cash', label: isVi ? 'Tiền mặt' : 'Cash' },
                  { value: 'bank', label: isVi ? 'Ngân hàng' : 'Bank' },
                  { value: 'online', label: isVi ? 'Trực tuyến' : 'Online' },
                ]}
              />
            </Form.Item>

            <Form.Item name="note" label={isVi ? 'Ghi chú' : 'Note'}>
              <Input.TextArea rows={4} />
            </Form.Item>

            <Space wrap>
              <Button type="primary" htmlType="submit" loading={isSubmitting} disabled={!hasValidAppointmentId}>
                {isVi ? 'Tạo thanh toán' : 'Create payment'}
              </Button>
              <Button onClick={() => navigate(ROUTES.receptionistAppointments)}>
                {isVi ? 'Quay lại danh sách lịch' : 'Back to appointments'}
              </Button>
            </Space>
          </Form>
        </Space>
      </Card>
    </div>
  );
}
