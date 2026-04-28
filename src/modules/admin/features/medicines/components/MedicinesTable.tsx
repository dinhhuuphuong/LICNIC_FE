import { Button, Flex, Modal, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { type Medicine } from '@/services/medicineService';

import { SEARCH_PARAMS } from '@/constants/search-params';
import { useSearchParams } from 'react-router-dom';
import { useDeleteMedicineMutation } from '../hooks/mutations/useDeleteMedicineMutation';
import { useGetMedicinesQuery } from '../hooks/queries/useGetMedicinesQuery';
import ModifyMedicine from './ModifyMedicine';

function formatCurrency(price: number) {
  if (Number.isNaN(price)) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN');
}

const MedicinesTable = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get(SEARCH_PARAMS.KEYWORD) ?? undefined;

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isFetching } = useGetMedicinesQuery({ page, limit, keyword });
  const medicines: Medicine[] = data?.data.items ?? [];
  const total = data?.data.total ?? 0;
  const deleteMedicineMutation = useDeleteMedicineMutation();

  const handleDelete = useCallback(
    (record: Medicine) => {
      Modal.confirm({
        title: 'Xác nhận xóa thuốc',
        content: `Bạn có chắc muốn xóa "${record.medicineName ?? `ID ${record.medicineId}`}"?`,
        okText: 'Xóa',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            const res = await deleteMedicineMutation.mutateAsync(record.medicineId);
            message.success(res.message || 'Đã xóa thuốc');
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Xóa thất bại';
            message.error(msg);
          }
        },
      });
    },
    [deleteMedicineMutation],
  );

  const columns = useMemo<ColumnsType<Medicine>>(
    () => [
      {
        title: 'ID',
        dataIndex: 'medicineId',
        key: 'medicineId',
      },
      {
        title: 'Tên thuốc',
        dataIndex: 'medicineName',
        key: 'medicineName',
      },
      {
        title: 'Hoạt chất',
        dataIndex: 'activeIngredient',
        key: 'activeIngredient',
        render: (value: string | null | undefined) => value ?? '—',
      },
      {
        title: 'Mô tả',
        dataIndex: 'description',
        key: 'description',
        render: (value: string | null | undefined) => value ?? '—',
      },
      {
        title: 'Giá',
        dataIndex: 'price',
        key: 'price',
        render: (value: number | null | undefined) => (value == null ? '—' : formatCurrency(Number(value))),
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (createdAt: string | undefined) => (createdAt ? formatDate(createdAt) : '—'),
      },
      {
        title: '',
        key: 'action',
        fixed: 'right',
        render: (_, record) => (
          <Flex gap={8} justify="center" align="center">
            <ModifyMedicine
              medicineId={record.medicineId}
              trigger={<Button variant="text" color="primary" icon={<Pencil size={16} />} />}
            />
            <Button
              danger
              type="text"
              icon={<Trash2 size={16} />}
              loading={deleteMedicineMutation.isPending}
              disabled={deleteMedicineMutation.isPending}
              onClick={() => handleDelete(record)}
            />
          </Flex>
        ),
      },
    ],
    [deleteMedicineMutation.isPending, handleDelete],
  );

  return (
    <Table
      rowKey="medicineId"
      columns={columns}
      dataSource={medicines}
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

export default MedicinesTable;
