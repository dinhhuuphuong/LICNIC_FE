import { Button, Flex, Modal, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { type ServiceCategory } from '@/services/serviceCategoryService';

import { SEARCH_PARAMS } from '@/constants/search-params';
import { useSearchParams } from 'react-router-dom';
import { useDeleteServiceCategoryMutation } from '../hooks/mutations/useDeleteServiceCategoryMutation';
import { useGetServiceCategoriesQuery } from '../hooks/queries/useGetServiceCategoriesQuery';
import ModifyServiceCategory from './ModifyServiceCategory';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN');
}

const ServiceCategoriesTable = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get(SEARCH_PARAMS.KEYWORD) ?? undefined;

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isFetching } = useGetServiceCategoriesQuery({ page, limit, keyword });
  const categories: ServiceCategory[] = data?.data.items ?? [];
  const total = data?.data.total ?? 0;
  const deleteServiceCategoryMutation = useDeleteServiceCategoryMutation();

  const handleDelete = useCallback(
    (record: ServiceCategory) => {
      Modal.confirm({
        title: 'Xác nhận xóa danh mục',
        content: `Bạn có chắc muốn xóa "${record.categoryName ?? `ID ${record.categoryId}`}"?`,
        okText: 'Xóa',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            const res = await deleteServiceCategoryMutation.mutateAsync(record.categoryId);
            message.success(res.message || 'Đã xóa danh mục dịch vụ');
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Xóa thất bại';
            message.error(msg);
          }
        },
      });
    },
    [deleteServiceCategoryMutation],
  );

  const columns = useMemo<ColumnsType<ServiceCategory>>(
    () => [
      {
        title: 'ID',
        dataIndex: 'categoryId',
        key: 'categoryId',
      },
      {
        title: 'Tên danh mục',
        dataIndex: 'categoryName',
        key: 'categoryName',
      },
      {
        title: 'Mô tả',
        dataIndex: 'description',
        key: 'description',
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
            <ModifyServiceCategory
              categoryId={record.categoryId}
              trigger={<Button variant="text" color="primary" icon={<Pencil size={16} />} />}
            />
            <Button
              danger
              type="text"
              icon={<Trash2 size={16} />}
              loading={deleteServiceCategoryMutation.isPending}
              disabled={deleteServiceCategoryMutation.isPending}
              onClick={() => handleDelete(record)}
            />
          </Flex>
        ),
      },
    ],
    [deleteServiceCategoryMutation.isPending, handleDelete],
  );

  return (
    <Table
      rowKey="categoryId"
      columns={columns}
      dataSource={categories}
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

export default ServiceCategoriesTable;
