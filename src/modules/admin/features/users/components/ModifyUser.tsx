import { Button, Form, Input, InputNumber, Modal, Select, message } from 'antd';
import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { type CreateUserPayload, type User } from '@/services/userService';

import { useCreateUserMutation } from '../hooks/mutations/useCreateUserMutation';

type ModifyUserProps = {
  trigger?: ReactElement;
  initialValues?: Partial<CreateUserPayload>;
  onSuccess?: (user: User) => void;
};

const STATUS_OPTIONS = [
  { value: 'active', label: 'active' },
  { value: 'inactive', label: 'inactive' },
];

const ModifyUser = ({ trigger, initialValues, onSuccess }: ModifyUserProps) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const createUserMutation = useCreateUserMutation();

  const isEditLike = useMemo(() => Boolean(initialValues?.email || initialValues?.name), [initialValues]);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      name: initialValues?.name ?? undefined,
      email: initialValues?.email ?? undefined,
      phone: initialValues?.phone ?? undefined,
      roleId: initialValues?.roleId ?? 1,
      status: (initialValues?.status as string) ?? 'active',
    });
  }, [form, initialValues, open]);

  async function handleFinish(values: CreateUserPayload) {
    try {
      const res = await createUserMutation.mutateAsync(values);
      const created = res.data;
      message.success(res.message || 'Thành công');
      setOpen(false);
      form.resetFields();
      onSuccess?.(created);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Tạo người dùng thất bại';
      message.error(msg);
    }
  }

  const triggerNode = trigger ? (
    // Clone để giữ nguyên các props/appearance của nút trigger từ parent.
    // Khi bấm sẽ mở modal ModifyUser.
    (() => {
      if (!trigger) return null;
      return (
        <span style={{ display: 'inline-block' }} onClick={() => setOpen(true)} role="button" tabIndex={0}>
          {trigger}
        </span>
      );
    })()
  ) : (
    <Button type="primary" onClick={() => setOpen(true)}>
      Thêm người dùng
    </Button>
  );

  return (
    <>
      {triggerNode}
      <Modal
        open={open}
        title={isEditLike ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={createUserMutation.isPending}
        destroyOnClose
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            roleId: 1,
            status: 'active',
          }}
        >
          <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
            <Input placeholder="Nguyen Van A" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="a@example.com" />
          </Form.Item>

          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
            <Input.Password placeholder="P@ssw0rd123" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input placeholder="0901234567" />
          </Form.Item>

          <Form.Item
            name="roleId"
            label="Vai trò (roleId)"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModifyUser;
