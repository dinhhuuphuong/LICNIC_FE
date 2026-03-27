import { Button, Flex, Modal, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { type Service } from '@/services/serviceService';

import { SEARCH_PARAMS } from '@/constants/search-params';
import { useSearchParams } from 'react-router-dom';
import { useDeleteServiceMutation } from '../hooks/mutations/useDeleteServiceMutation';
import { useGetServicesQuery } from '../hooks/queries/useGetServicesQuery';
import ModifyService from './ModifyService';

function formatCurrency(cost: number) {
  if (Number.isNaN(cost)) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cost);
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN');
}

const ServicesTable = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get(SEARCH_PARAMS.STATUS);
  const categoryParam = searchParams.get(SEARCH_PARAMS.CATEGORY);
  const keyword = searchParams.get(SEARCH_PARAMS.KEYWORD) ?? undefined;

  const status = statusParam === null ? undefined : statusParam === 'true';
  const category = categoryParam ? Number(categoryParam) : undefined;

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isFetching } = useGetServicesQuery({ page, limit, status, category, keyword });
  const services: Service[] = data?.data.items ?? [];
  const total = data?.data.total ?? 0;
  const deleteServiceMutation = useDeleteServiceMutation();

  const handleDelete = useCallback(
    (record: Service) => {
      Modal.confirm({
        title: 'Xác nhận xóa dịch vụ',
        content: `Bạn có chắc muốn xóa "${record.serviceName ?? `ID ${record.serviceId}`}"?`,
        okText: 'Xóa',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            const res = await deleteServiceMutation.mutateAsync(record.serviceId);
            message.success(res.message || 'Đã xóa dịch vụ');
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Xóa thất bại';
            message.error(msg);
          }
        },
      });
    },
    [deleteServiceMutation],
  );

  const columns = useMemo<ColumnsType<Service>>(
    () => [
      {
        title: 'ID',
        dataIndex: 'serviceId',
        key: 'serviceId',
      },
      {
        title: 'Tên dịch vụ',
        dataIndex: 'serviceName',
        key: 'serviceName',
      },
      {
        title: 'Danh mục',
        key: 'category',
        render: (_, record) => record.category?.categoryName ?? String(record.categoryId),
      },
      {
        title: 'Chi phí',
        dataIndex: 'cost',
        key: 'cost',
        render: (value) => formatCurrency(Number(value)),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (value: boolean) => (value ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng</Tag>),
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
            <ModifyService
              serviceId={record.serviceId}
              trigger={<Button variant="text" color="primary" icon={<Pencil size={16} />} />}
            />
            <Button
              danger
              type="text"
              icon={<Trash2 size={16} />}
              loading={deleteServiceMutation.isPending}
              disabled={deleteServiceMutation.isPending}
              onClick={() => handleDelete(record)}
            />
          </Flex>
        ),
      },
    ],
    [deleteServiceMutation.isPending, handleDelete],
  );

  return (
    <Table
      rowKey="serviceId"
      columns={columns}
      dataSource={services}
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

export default ServicesTable;
