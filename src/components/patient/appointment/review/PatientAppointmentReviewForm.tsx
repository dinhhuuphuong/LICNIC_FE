import { Button, Form, Input, Rate } from 'antd';

const { TextArea } = Input;

type PatientAppointmentReviewFormValues = {
  rating: number;
  comment: string;
};

type PatientAppointmentReviewFormProps = {
  isVi: boolean;
  submitLabel?: string;
  isSubmitting: boolean;
  initialValues?: {
    rating: number;
    comment: string;
  };
  onSubmitReview: (payload: { rating: number; comment: string }) => Promise<unknown>;
  onCancel?: () => void;
};

export function PatientAppointmentReviewForm({
  isVi,
  submitLabel,
  isSubmitting,
  initialValues,
  onSubmitReview,
  onCancel,
}: PatientAppointmentReviewFormProps) {
  const [form] = Form.useForm<PatientAppointmentReviewFormValues>();

  const handleFinish = async (values: PatientAppointmentReviewFormValues) => {
    await onSubmitReview({
      rating: values.rating,
      comment: values.comment.trim(),
    });
    if (!initialValues) {
      form.resetFields();
      form.setFieldValue('rating', 5);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <Form<PatientAppointmentReviewFormValues>
        form={form}
        layout="vertical"
        initialValues={{ rating: initialValues?.rating ?? 5, comment: initialValues?.comment ?? '' }}
        onFinish={(values) => void handleFinish(values)}
        disabled={isSubmitting}
      >
        <Form.Item
          name="rating"
          rules={[
            {
              required: true,
              type: 'number',
              min: 1,
              max: 5,
              message: isVi ? 'Vui lòng chọn số sao từ 1 đến 5.' : 'Please select a rating between 1 and 5.',
            },
          ]}
        >
          <Rate />
        </Form.Item>

        <Form.Item
          name="comment"
          label={isVi ? 'Nội dung đánh giá' : 'Review comment'}
          rules={[
            {
              validator: async (_, value: string | undefined) => {
                if (value && value.trim().length > 0) return;
                throw new Error(isVi ? 'Vui lòng nhập nhận xét.' : 'Please enter your comment.');
              },
            },
          ]}
        >
          <TextArea
            rows={4}
            maxLength={1000}
            showCount
            placeholder={isVi ? 'Ví dụ: Rất hài lòng với dịch vụ.' : 'Example: Very satisfied with the service.'}
          />
        </Form.Item>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            {isVi ? 'Vui lòng nhập nhận xét trước khi gửi.' : 'Please enter a comment before submitting.'}
          </p>
          <div className="flex items-center gap-2">
            {onCancel ? (
              <Button onClick={onCancel} disabled={isSubmitting}>
                {isVi ? 'Hủy' : 'Cancel'}
              </Button>
            ) : null}
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {submitLabel || (isVi ? 'Gửi đánh giá' : 'Submit review')}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
