import { getReceptionistPaymentDetailRoute } from '@/constants/routes';
import { createReceptionistPaymentFromAppointment } from '@/services/paymentService';
import { Alert, Button, Form, Input, Modal, Select } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type PaymentFormValues = {
  paymentMethod: 'cash' | 'bank' | 'online';
  note: string;
};

type ReceptionistCreatePaymentModalProps = {
  appointmentId: number;
  isVi: boolean;
  open: boolean;
  onClose: () => void;
};

export function ReceptionistCreatePaymentModal({
  appointmentId,
  isVi,
  open,
  onClose,
}: ReceptionistCreatePaymentModalProps) {
  const navigate = useNavigate();
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);
  const [paymentForm] = Form.useForm<PaymentFormValues>();

  const closeModal = () => {
    setPaymentErrorMessage(null);
    setPaymentSuccessMessage(null);
    paymentForm.resetFields();
    onClose();
  };

  const handleCreatePayment = async (values: PaymentFormValues) => {
    setPaymentErrorMessage(null);
    setPaymentSuccessMessage(null);
    setIsSubmittingPayment(true);
    try {
      const response = await createReceptionistPaymentFromAppointment({
        appointmentId,
        paymentMethod: values.paymentMethod,
        paymentStatus: 'pending',
        ...(values.note?.trim() ? { note: values.note.trim() } : {}),
      });
      const createdPaymentId = response.data.paymentId;

      if (!createdPaymentId) {
        throw new Error(
          isVi ? 'Không lấy được paymentId sau khi tạo thanh toán.' : 'Missing paymentId after creation.',
        );
      }

      closeModal();
      navigate(getReceptionistPaymentDetailRoute(createdPaymentId));
    } catch (error) {
      setPaymentErrorMessage(
        error instanceof Error ? error.message : isVi ? 'Tạo thanh toán thất bại.' : 'Create payment failed.',
      );
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <Modal
      title={isVi ? `Tạo thanh toán #${appointmentId}` : `Create payment #${appointmentId}`}
      open={open}
      onCancel={closeModal}
      footer={null}
      destroyOnHidden
    >
      {paymentErrorMessage ? <Alert type="error" showIcon message={paymentErrorMessage} className="mb-4" /> : null}
      {paymentSuccessMessage ? (
        <Alert type="success" showIcon message={paymentSuccessMessage} className="mb-4" />
      ) : null}

      <Form<PaymentFormValues>
        form={paymentForm}
        layout="vertical"
        disabled={isSubmittingPayment}
        initialValues={{
          paymentMethod: 'cash',
          note: '',
        }}
        onFinish={handleCreatePayment}
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

        <div className="flex justify-end gap-2">
          <Button onClick={closeModal}>{isVi ? 'Đóng' : 'Close'}</Button>
          <Button type="primary" htmlType="submit" loading={isSubmittingPayment}>
            {isVi ? 'Tạo thanh toán' : 'Create payment'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
