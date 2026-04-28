import { Button, Form, Input, Modal, Popconfirm, Space, message } from 'antd';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

type ReceptionistReviewActionsProps = {
  isVi: boolean;
  reviewId: number;
  status?: string;
  onApprove: (reviewId: number) => Promise<void>;
  onReject: (reviewId: number, reason: string) => Promise<void>;
};

function isPendingStatus(status?: string) {
  return status?.trim().toLowerCase() === 'pending';
}

export function ReceptionistReviewActions({
  isVi,
  reviewId,
  status,
  onApprove,
  onReject,
}: ReceptionistReviewActionsProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSubmittingApprove, setIsSubmittingApprove] = useState(false);
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);
  const [form] = Form.useForm<{ reason: string }>();
  const canHandle = isPendingStatus(status);

  async function handleApprove() {
    try {
      setIsSubmittingApprove(true);
      await onApprove(reviewId);
      messageApi.success(isVi ? 'Duyệt review thành công.' : 'Review approved successfully.');
    } catch (error) {
      const fallback = isVi ? 'Duyệt review thất bại.' : 'Approve review failed.';
      messageApi.error(error instanceof Error ? error.message : fallback);
    } finally {
      setIsSubmittingApprove(false);
    }
  }

  async function handleRejectSubmit() {
    try {
      const values = await form.validateFields();
      setIsSubmittingReject(true);
      await onReject(reviewId, values.reason.trim());
      messageApi.success(isVi ? 'Từ chối review thành công.' : 'Review rejected successfully.');
      setIsRejectModalOpen(false);
      form.resetFields();
    } catch (error) {
      if (error instanceof Error) {
        messageApi.error(error.message);
      }
    } finally {
      setIsSubmittingReject(false);
    }
  }

  return (
    <>
      {contextHolder}
      <Space
        size={8}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Popconfirm
          title={isVi ? 'Xác nhận duyệt review?' : 'Confirm approving this review?'}
          okText={isVi ? 'Duyệt' : 'Approve'}
          cancelText={isVi ? 'Hủy' : 'Cancel'}
          onConfirm={handleApprove}
          disabled={!canHandle}
        >
          <Button
            icon={<Check size={16} />}
            color="green"
            variant="text"
            size="small"
            loading={isSubmittingApprove}
            disabled={!canHandle || isSubmittingReject}
          />
        </Popconfirm>
        <Button
          icon={<X size={16} />}
          color="red"
          variant="text"
          size="small"
          disabled={!canHandle || isSubmittingApprove}
          onClick={() => {
            setIsRejectModalOpen(true);
          }}
        />
      </Space>
      <Modal
        title={isVi ? 'Từ chối review' : 'Reject review'}
        open={isRejectModalOpen}
        okText={isVi ? 'Xác nhận từ chối' : 'Confirm reject'}
        cancelText={isVi ? 'Hủy' : 'Cancel'}
        okButtonProps={{ danger: true, loading: isSubmittingReject }}
        onOk={handleRejectSubmit}
        onCancel={() => {
          if (isSubmittingReject) return;
          setIsRejectModalOpen(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={isVi ? 'Lý do từ chối' : 'Rejection reason'}
            name="reason"
            rules={[
              {
                required: true,
                message: isVi ? 'Vui lòng nhập lý do từ chối.' : 'Please enter rejection reason.',
              },
              {
                validator: async (_, value: string | undefined) => {
                  if (!value?.trim()) {
                    throw new Error(isVi ? 'Vui lòng nhập lý do từ chối.' : 'Please enter rejection reason.');
                  }
                },
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              maxLength={500}
              placeholder={
                isVi
                  ? 'Nhập lý do từ chối, ví dụ: nội dung không phù hợp quy định hiển thị công khai.'
                  : 'Enter rejection reason.'
              }
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
