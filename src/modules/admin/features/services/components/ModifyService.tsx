import { Button, Col, Form, Input, Modal, Row, Select, Switch, message } from 'antd';
import type { ReactElement } from 'react';
import { cloneElement, useEffect, useState } from 'react';

import { type CreateServicePayload, type Service, type UpdateServicePayload } from '@/services/serviceService';

import MoneyInput from '@/components/common/inputs/money-input';
import { useGetServiceCategoriesQuery } from '@/modules/admin/features/service-categories/hooks/queries/useGetServiceCategoriesQuery';
import { useCreateServiceMutation } from '../hooks/mutations/useCreateServiceMutation';
import { useUpdateServiceMutation } from '../hooks/mutations/useUpdateServiceMutation';
import { useGetServiceDetailQuery } from '../hooks/queries/useGetServiceDetailQuery';

type ModifyServiceProps = {
  trigger?: ReactElement;
  serviceId?: number;
  initialValues?: Partial<CreateServicePayload>;
  onSuccess?: (service: Service) => void;
};

const ModifyService = ({ trigger, serviceId, initialValues, onSuccess }: ModifyServiceProps) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const createServiceMutation = useCreateServiceMutation();
  const updateServiceMutation = useUpdateServiceMutation();

  const editServiceId = (initialValues as Service)?.serviceId as number | undefined;
  const effectiveServiceId = serviceId ?? editServiceId;

  const serviceDetailQuery = useGetServiceDetailQuery(effectiveServiceId, open);
  const categoriesQuery = useGetServiceCategoriesQuery({ page: 1, limit: 100 });
  const categoryOptions =
    categoriesQuery.data?.data.items.map((c) => ({
      label: c.categoryName,
      value: c.categoryId,
    })) ?? [];

  useEffect(() => {
    if (!open) return;
    const detail = serviceDetailQuery.data?.data;
    form.setFieldsValue({
      serviceName: detail?.serviceName ?? initialValues?.serviceName ?? undefined,
      whatIs: detail?.whatIs ?? initialValues?.whatIs ?? undefined,
      method: detail?.method ?? initialValues?.method ?? undefined,
      cost: detail?.cost ?? initialValues?.cost ?? undefined,
      process: detail?.process ?? initialValues?.process ?? undefined,
      trustedAddress: detail?.trustedAddress ?? initialValues?.trustedAddress ?? undefined,
      categoryId: detail?.categoryId ?? initialValues?.categoryId ?? undefined,
      status: detail?.status ?? initialValues?.status ?? true,
    });
  }, [form, initialValues, open, serviceDetailQuery.data]);

  async function handleFinish(values: CreateServicePayload) {
    try {
      if (effectiveServiceId) {
        const payload: UpdateServicePayload = {
          serviceName: values.serviceName,
          whatIs: values.whatIs,
          method: values.method,
          cost: values.cost,
          process: values.process,
          trustedAddress: values.trustedAddress,
          status: values.status,
          categoryId: values.categoryId,
        };
        const res = await updateServiceMutation.mutateAsync({
          serviceId: effectiveServiceId,
          payload,
        });
        message.success(res.message || 'Thành công');
        setOpen(false);
        form.resetFields();
        onSuccess?.(res.data);
        return;
      }

      const res = await createServiceMutation.mutateAsync(values);
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
      Thêm dịch vụ
    </Button>
  );

  const submitting = createServiceMutation.isPending || updateServiceMutation.isPending;

  return (
    <>
      {triggerNode}
      <Modal
        open={open}
        title={effectiveServiceId ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ'}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={submitting}
        destroyOnHidden
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        width={800}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            status: true,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="serviceName"
                label="Tên dịch vụ"
                rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ' }]}
              >
                <Input placeholder="Nhổ răng" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="Danh mục dịch vụ"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select
                  options={categoryOptions}
                  loading={categoriesQuery.isFetching}
                  placeholder="Chọn danh mục"
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="whatIs"
            label="Giới thiệu (What is)"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea
              placeholder="Nhổ răng là thủ thuật nha khoa giúp loại bỏ răng bị hư hỏng..."
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>

          <Form.Item
            name="method"
            label="Phương pháp thực hiện"
            rules={[{ required: true, message: 'Vui lòng nhập phương pháp' }]}
          >
            <Input.TextArea
              placeholder="Bác sĩ khám tổng quát, gây tê tại chỗ..."
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>

          <Form.Item name="process" label="Quy trình" rules={[{ required: true, message: 'Vui lòng nhập quy trình' }]}>
            <Input.TextArea
              placeholder="Khám - Chụp phim - Tư vấn - Gây tê - Nhổ răng - Hướng dẫn chăm sóc..."
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>

          <Form.Item
            name="trustedAddress"
            label="Địa chỉ uy tín/Khuyến nghị"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ/khuyến nghị' }]}
          >
            <Input.TextArea
              placeholder="Nên thực hiện tại cơ sở nha khoa uy tín..."
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cost"
                label="Chi phí (VND)"
                rules={[{ required: true, message: 'Vui lòng nhập chi phí' }]}
              >
                <MoneyInput style={{ width: '100%' }} min={0} step={50000} placeholder="800000" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" valuePropName="checked">
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default ModifyService;
