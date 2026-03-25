import { Button, Flex, Modal, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useMemo, useState } from 'react';

import { DEFAULT_AVATAR_URL } from '@/constants';
import { type User } from '@/services/userService';

import { Pencil, Trash2 } from 'lucide-react';
import { useDeleteUserMutation } from '../hooks/mutations/useDeleteUserMutation';
import { useGetUsersQuery } from '../hooks/queries/useGetUsersQuery';
import ModifyUser from './ModifyUser';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN');
}

const UsersTable = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isFetching } = useGetUsersQuery({ page, limit });
  const users: User[] = data?.data.items ?? [];
  const total = data?.data.total ?? 0;
  const deleteUserMutation = useDeleteUserMutation();

  const handleDelete = useCallback(
    (record: User) => {
      Modal.confirm({
        title: 'Xác nhận xóa người dùng',
        content: `Bạn có chắc muốn xóa "${record.name ?? record.email ?? `ID ${record.userId}`}"?`,
        okText: 'Xóa',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            const res = await deleteUserMutation.mutateAsync(record.userId);
            message.success(res.message || 'Đã xóa người dùng');
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Xóa thất bại';
            message.error(msg);
          }
        },
      });
    },
    [deleteUserMutation],
  );

  const columns = useMemo<ColumnsType<User>>(
    () => [
      {
        title: 'ID',
        dataIndex: 'userId',
        key: 'userId',
      },
      {
        title: 'Avatar',
        dataIndex: 'avatar',
        key: 'avatar',
        render: (avatar) => (
          <img
            src={avatar ?? DEFAULT_AVATAR_URL}
            alt="avatar"
            style={{ width: 36, height: 36, borderRadius: '9999px', objectFit: 'cover' }}
            // Nếu URL avatar lỗi (404, network, ...) thì thay bằng ảnh mặc định.
            onError={(event) => {
              const img = event.currentTarget;
              img.onerror = null; // tránh vòng lặp
              img.src = DEFAULT_AVATAR_URL;
            }}
          />
        ),
      },
      {
        title: 'Họ và tên',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: 'Số điện thoại',
        dataIndex: 'phone',
        key: 'phone',
      },
      {
        title: 'Vai trò',
        key: 'role',
        render: (_, record) => record.role?.roleName ?? String(record.roleId),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (createdAt) => formatDate(String(createdAt)),
      },
      {
        title: '',
        key: 'action',
        fixed: 'right',
        render: (_, record) => (
          <Flex gap={8} justify="center" align="center">
            <ModifyUser
              userId={record.userId}
              trigger={<Button variant="text" color="primary" icon={<Pencil size={16} />} />}
            />
            <Button
              danger
              type="text"
              icon={<Trash2 size={16} />}
              loading={deleteUserMutation.isPending}
              disabled={deleteUserMutation.isPending}
              onClick={() => handleDelete(record)}
            />
          </Flex>
        ),
      },
    ],
    [deleteUserMutation.isPending, handleDelete],
  );

  return (
    <Table
      rowKey="userId"
      columns={columns}
      dataSource={users}
      loading={isFetching}
      scroll={{
        x: 'max-content',
      }}
      pagination={{
        current: page,
        pageSize: limit,
        total,
        showSizeChanger: false,
        onChange: (nextPage) => setPage(nextPage),
      }}
    />
  );
};

export default UsersTable;
