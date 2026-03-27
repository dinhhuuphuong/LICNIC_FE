import { useQuery } from '@tanstack/react-query';
import { Button, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select, Spin, Switch, message } from 'antd';
import dayjs from 'dayjs';
import type { ReactElement } from 'react';
import { cloneElement, useEffect, useMemo, useState } from 'react';

import {
  type CreatePaymentDiscountPayload,
  type PaymentDiscount,
  type PaymentDiscountType,
  type UpdatePaymentDiscountPayload,
} from '@/services/paymentDiscountService';
import { getServices } from '@/services/serviceService';
import { getUsers } from '@/services/userService';
import { useCreatePaymentDiscountMutation } from '../hooks/mutations/useCreatePaymentDiscountMutation';
import { useUpdatePaymentDiscountMutation } from '../hooks/mutations/useUpdatePaymentDiscountMutation';
import { useGetPaymentDiscountDetailQuery } from '../hooks/queries/useGetPaymentDiscountDetailQuery';

type ModifyPaymentDiscountProps = {
  trigger?: ReactElement;
  discountId?: number;
  initialValues?: Partial<CreatePaymentDiscountPayload>;
  onSuccess?: (discount: PaymentDiscount) => void;
};

type PaymentDiscountFormValues = {
  name: string;
  description?: string;
  discountType: PaymentDiscountType;
  discountValue: number;
  isActive: boolean;
  appliesAllServices: boolean;
  serviceIds?: number[];
  appliesAllUsers: boolean;
  userIds?: number[];
  startAt?: dayjs.Dayjs | null;
  endAt?: dayjs.Dayjs | null;
  limitPerUser?: number | null;
};

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'percent', label: 'Phần trăm (%)' },
  { value: 'amount', label: 'Số tiền (VND)' },
];

const ModifyPaymentDiscount = ({ trigger, discountId, initialValues, onSuccess }: ModifyPaymentDiscountProps) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<PaymentDiscountFormValues>();
  const createMutation = useCreatePaymentDiscountMutation();
  const updateMutation = useUpdatePaymentDiscountMutation();

  const editDiscountId = (initialValues as PaymentDiscount)?.discountId as number | undefined;
  const effectiveDiscountId = discountId ?? editDiscountId;

  const detailQuery = useGetPaymentDiscountDetailQuery(effectiveDiscountId, open);
  const servicesQuery = useQuery({
    queryKey: ['services', 'forPaymentDiscountForm'],
    queryFn: () => getServices({ page: 1, limit: 100 }),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });
  const usersQuery = useQuery({
    queryKey: ['users', 'forPaymentDiscountForm'],
    queryFn: () => getUsers({ page: 1, limit: 100 }),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const serviceOptions = useMemo(
    () =>
      (servicesQuery.data?.data.items ?? []).map((service) => ({
        value: service.serviceId,
        label: service.serviceName,
      })),
    [servicesQuery.data?.data.items],
  );

  const userOptions = useMemo(
    () =>
      (usersQuery.data?.data.items ?? []).map((user) => ({
        value: user.userId,
        label: `${user.name} - ${user.email}`,
      })),
    [usersQuery.data?.data.items],
  );

  useEffect(() => {
    if (!open) return;
    const detail = detailQuery.data?.data;
    form.setFieldsValue({
      name: detail?.name ?? initialValues?.name ?? undefined,
      description: detail?.description ?? initialValues?.description ?? undefined,
      discountType: detail?.discountType ?? initialValues?.discountType ?? 'percent',
      discountValue: detail?.discountValue ?? initialValues?.discountValue ?? undefined,
      isActive: detail?.isActive ?? initialValues?.isActive ?? true,
      appliesAllServices: detail?.appliesAllServices ?? initialValues?.appliesAllServices ?? true,
      serviceIds: detail?.paymentDiscountServices?.map((item) => item.serviceId) ?? initialValues?.serviceIds ?? [],
      appliesAllUsers: detail?.appliesAllUsers ?? initialValues?.appliesAllUsers ?? true,
      userIds: detail?.paymentDiscountUsers?.map((item) => item.userId) ?? initialValues?.userIds ?? [],
      startAt: detail?.startAt ? dayjs(detail.startAt) : initialValues?.startAt ? dayjs(initialValues.startAt) : null,
      endAt: detail?.endAt ? dayjs(detail.endAt) : initialValues?.endAt ? dayjs(initialValues.endAt) : null,
      limitPerUser: detail?.limitPerUser ?? initialValues?.limitPerUser ?? null,
    });
  }, [detailQuery.data, form, initialValues, open]);

  const appliesAllServices = Form.useWatch('appliesAllServices', form);
  const appliesAllUsers = Form.useWatch('appliesAllUsers', form);
  const selectedDiscountType = Form.useWatch('discountType', form);

  async function handleFinish(values: PaymentDiscountFormValues) {
    if (values.startAt && values.endAt && values.startAt.isAfter(values.endAt)) {
      message.error('Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc');
      return;
    }

    try {
      const normalizedPayload: CreatePaymentDiscountPayload = {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        discountType: values.discountType,
        discountValue: Number(values.discountValue),
        isActive: values.isActive,
        appliesAllServices: values.appliesAllServices,
        appliesAllUsers: values.appliesAllUsers,
        startAt: values.startAt ? values.startAt.toISOString() : null,
        endAt: values.endAt ? values.endAt.toISOString() : null,
        limitPerUser: values.limitPerUser == null ? null : Number(values.limitPerUser),
      };

      if (!values.appliesAllServices) {
        normalizedPayload.serviceIds = values.serviceIds ?? [];
      }
      if (!values.appliesAllUsers) {
        normalizedPayload.userIds = values.userIds ?? [];
      }

      if (effectiveDiscountId) {
        const payload: UpdatePaymentDiscountPayload = { ...normalizedPayload };
        const res = await updateMutation.mutateAsync({ discountId: effectiveDiscountId, payload });
        message.success(res.message || 'Thành công');
        setOpen(false);
        form.resetFields();
        onSuccess?.(res.data);
        return;
      }

      const res = await createMutation.mutateAsync(normalizedPayload);
      message.success(res.message || 'Thành công');
      setOpen(false);
      form.resetFields();
      onSuccess?.(res.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Thao tác thất bại';
      message.error(msg);
    }
  }

  const triggerNode = trigger ? (
    cloneElement(trigger, {
      onClick: (e: unknown) => {
        trigger.props?.onClick?.(e);
        setOpen(true);
      },
    })
  ) : (
    <Button type="primary" onClick={() => setOpen(true)}>
      Thêm ưu đãi
    </Button>
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      {triggerNode}
      <Modal
        open={open}
        title={effectiveDiscountId ? 'Chỉnh sửa ưu đãi thanh toán' : 'Thêm ưu đãi thanh toán'}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={submitting}
        destroyOnHidden
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        width={760}
        centered
      >
        <Spin spinning={servicesQuery.isFetching || usersQuery.isFetching || detailQuery.isFetching}>
          <Form<PaymentDiscountFormValues>
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{
              discountType: 'percent',
              isActive: true,
              appliesAllServices: true,
              appliesAllUsers: true,
              serviceIds: [],
              userIds: [],
              startAt: null,
              endAt: null,
              limitPerUser: null,
            }}
          >
            <Row gutter={8}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Tên ưu đãi"
                  rules={[{ required: true, message: 'Vui lòng nhập tên ưu đãi' }]}
                >
                  <Input placeholder="Giảm 10% cho khách hàng mới" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="description" label="Mô tả">
                  <Input.TextArea placeholder="Mô tả ưu đãi (không bắt buộc)" autoSize={{ minRows: 2, maxRows: 4 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="discountType"
                  label="Loại giảm giá"
                  rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
                >
                  <Select options={DISCOUNT_TYPE_OPTIONS} placeholder="Chọn loại giảm giá" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="discountValue"
                  label={selectedDiscountType === 'percent' ? 'Giá trị (%)' : 'Giá trị (VND)'}
                  rules={[
                    { required: true, message: 'Vui lòng nhập giá trị giảm giá' },
                    {
                      validator: (_, value: number | undefined) => {
                        if (value == null) return Promise.resolve();
                        if (value <= 0) return Promise.reject(new Error('Giá trị phải lớn hơn 0'));
                        if (selectedDiscountType === 'percent' && value > 100) {
                          return Promise.reject(new Error('Phần trăm giảm tối đa là 100'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={selectedDiscountType === 'percent' ? 1 : 1000}
                    placeholder={selectedDiscountType === 'percent' ? '10' : '100000'}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="appliesAllServices" label="Phạm vi dịch vụ" valuePropName="checked">
                  <Switch checkedChildren="Tất cả dịch vụ" unCheckedChildren="Theo dịch vụ chỉ định" />
                </Form.Item>

                {!appliesAllServices ? (
                  <Form.Item
                    name="serviceIds"
                    label="Dịch vụ áp dụng"
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 dịch vụ' }]}
                  >
                    <Select
                      mode="multiple"
                      options={serviceOptions}
                      loading={servicesQuery.isFetching}
                      placeholder="Chọn dịch vụ áp dụng"
                      optionFilterProp="label"
                      showSearch
                    />
                  </Form.Item>
                ) : null}
              </Col>
              <Col span={12}>
                <Form.Item name="appliesAllUsers" label="Phạm vi người dùng" valuePropName="checked">
                  <Switch checkedChildren="Tất cả người dùng" unCheckedChildren="Theo người dùng chỉ định" />
                </Form.Item>

                {!appliesAllUsers ? (
                  <Form.Item
                    name="userIds"
                    label="Người dùng áp dụng"
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 người dùng' }]}
                  >
                    <Select
                      mode="multiple"
                      options={userOptions}
                      loading={usersQuery.isFetching}
                      placeholder="Chọn người dùng áp dụng"
                      optionFilterProp="label"
                      showSearch
                    />
                  </Form.Item>
                ) : null}
              </Col>
              <Col span={12}>
                <Form.Item name="startAt" label="Bắt đầu hiệu lực">
                  <DatePicker
                    className="w-full"
                    showTime
                    format="DD/MM/YYYY HH:mm:ss"
                    allowClear
                    placeholder="Chọn thời gian bắt đầu"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="endAt" label="Kết thúc hiệu lực">
                  <DatePicker
                    className="w-full"
                    showTime
                    format="DD/MM/YYYY HH:mm:ss"
                    allowClear
                    placeholder="Chọn thời gian kết thúc"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="limitPerUser" label="Giới hạn số lần dùng / người">
                  <InputNumber style={{ width: '100%' }} min={0} step={1} placeholder="Để trống = không giới hạn" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                  <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>
    </>
  );
};

export default ModifyPaymentDiscount;
