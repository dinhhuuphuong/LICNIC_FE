import { Button, Form, Input, Modal, message } from 'antd';
import type { ReactElement } from 'react';
import { cloneElement, useEffect, useState } from 'react';

import {
  type CreateServiceCategoryPayload,
  type ServiceCategory,
  type UpdateServiceCategoryPayload,
} from '@/services/serviceCategoryService';

import { useCreateServiceCategoryMutation } from '../hooks/mutations/useCreateServiceCategoryMutation';
import { useUpdateServiceCategoryMutation } from '../hooks/mutations/useUpdateServiceCategoryMutation';
import { useGetServiceCategoryDetailQuery } from '../hooks/queries/useGetServiceCategoryDetailQuery';

type ModifyServiceCategoryProps = {
  trigger?: ReactElement;
  categoryId?: number;
  initialValues?: Partial<CreateServiceCategoryPayload>;
  onSuccess?: (category: ServiceCategory) => void;
};

const ModifyServiceCategory = ({ trigger, categoryId, initialValues, onSuccess }: ModifyServiceCategoryProps) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const createServiceCategoryMutation = useCreateServiceCategoryMutation();
  const updateServiceCategoryMutation = useUpdateServiceCategoryMutation();

  const editCategoryId = (initialValues as ServiceCategory)?.categoryId as number | undefined;
  const effectiveCategoryId = categoryId ?? editCategoryId;
  const categoryDetailQuery = useGetServiceCategoryDetailQuery(effectiveCategoryId, open);

  useEffect(() => {
    if (!open) return;

    const detail = categoryDetailQuery.data?.data;
    form.setFieldsValue({
      categoryName: detail?.categoryName ?? initialValues?.categoryName ?? undefined,
      description: detail?.description ?? initialValues?.description ?? undefined,
    });
  }, [categoryDetailQuery.data, form, initialValues, open]);

  async function handleFinish(values: CreateServiceCategoryPayload) {
    try {
      if (effectiveCategoryId) {
        const payload: UpdateServiceCategoryPayload = {
          categoryName: values.categoryName,
          description: values.description,
        };
        const res = await updateServiceCategoryMutation.mutateAsync({
          categoryId: effectiveCategoryId,
          payload,
        });
        message.success(res.message || 'Thành công');
        setOpen(false);
        form.resetFields();
        onSuccess?.(res.data);
        return;
      }

      const res = await createServiceCategoryMutation.mutateAsync(values);
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
      Thêm danh mục
    </Button>
  );

  const submitting = createServiceCategoryMutation.isPending || updateServiceCategoryMutation.isPending;

  return (
    <>
      {triggerNode}
      <Modal
        open={open}
        title={effectiveCategoryId ? 'Chỉnh sửa danh mục dịch vụ' : 'Thêm danh mục dịch vụ'}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={submitting}
        destroyOnClose
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="categoryName"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input placeholder="Nha khoa tổng quát" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả danh mục' }]}
          >
            <Input.TextArea placeholder="Các dịch vụ cơ bản và tổng quát" autoSize={{ minRows: 3, maxRows: 5 }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModifyServiceCategory;
