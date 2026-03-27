import { Button, Form, Input, Modal, Select, message } from 'antd';
import type { ReactElement } from 'react';
import { cloneElement, useEffect, useState } from 'react';

import { type CreateUserPayload, type UpdateUserPayload, type User } from '@/services/userService';

import { useCreateUserMutation } from '../hooks/mutations/useCreateUserMutation';
import { useUpdateUserMutation } from '../hooks/mutations/useUpdateUserMutation';
import { useGetUserDetailQuery } from '../hooks/queries/useGetUserDetailQuery';
import SelectRole from './selects/select-role';

type ModifyUserProps = {
  trigger?: ReactElement;
  userId?: number;
  initialValues?: Partial<CreateUserPayload>;
  onSuccess?: (user: User) => void;
};

const STATUS_OPTIONS = [
  { value: 'active', label: 'active' },
  { value: 'inactive', label: 'inactive' },
];

const ModifyUser = ({ trigger, userId, initialValues, onSuccess }: ModifyUserProps) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();

  const editUserId = (initialValues as User)?.userId as number | undefined;
  const effectiveUserId = userId ?? editUserId;

  const userDetailQuery = useGetUserDetailQuery(effectiveUserId, open);

  useEffect(() => {
    if (!open) return;
    const detail = userDetailQuery.data?.data;
    form.setFieldsValue({
      name: detail?.name ?? initialValues?.name ?? undefined,
      email: detail?.email ?? initialValues?.email ?? undefined,
      phone: detail?.phone ?? initialValues?.phone ?? undefined,
      roleId: detail?.roleId ?? initialValues?.roleId ?? 1,
      status: (detail?.status as string) ?? (initialValues?.status as string) ?? 'active',
      password: undefined,
    });
  }, [form, initialValues, open, userDetailQuery.data]);

  async function handleFinish(values: CreateUserPayload) {
    try {
      if (effectiveUserId) {
        const payload: UpdateUserPayload = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          roleId: values.roleId,
          status: values.status,
        };
        if (values.password) payload.password = values.password;
        const res = await updateUserMutation.mutateAsync({ userId: effectiveUserId, payload });
        message.success(res.message || 'Thành công');
        setOpen(false);
        form.resetFields();
        onSuccess?.(res.data);
        return;
      }

      const res = await createUserMutation.mutateAsync(values);
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
      Thêm người dùng
    </Button>
  );

  const submitting = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <>
      {triggerNode}
      <Modal
        open={open}
        title={effectiveUserId ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={submitting}
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

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={effectiveUserId ? [] : [{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password placeholder="P@ssw0rd123" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input placeholder="0901234567" />
          </Form.Item>

          <Form.Item name="roleId" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
            <SelectRole />
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
