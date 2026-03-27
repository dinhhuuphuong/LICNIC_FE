import { Button, Flex, Modal, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { SEARCH_PARAMS } from '@/constants/search-params';
import { type PaymentDiscount, type PaymentDiscountType } from '@/services/paymentDiscountService';
import { useDeletePaymentDiscountMutation } from '../hooks/mutations/useDeletePaymentDiscountMutation';
import { useGetPaymentDiscountsQuery } from '../hooks/queries/useGetPaymentDiscountsQuery';
import ModifyPaymentDiscount from './ModifyPaymentDiscount';

function formatCurrency(amount: number) {
  if (Number.isNaN(amount)) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDateTime(dateStr?: string | null) {
  if (!dateStr) return 'Không giới hạn';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN');
}

function formatDiscountValue(type: PaymentDiscountType, value: number) {
  if (type === 'percent') return `${value}%`;
  return formatCurrency(value);
}

const PaymentDiscountsTable = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get(SEARCH_PARAMS.STATUS);
  const typeParam = searchParams.get(SEARCH_PARAMS.TYPE) as PaymentDiscountType | null;

  const isActive = statusParam === null ? undefined : statusParam === 'true';
  const discountType = typeParam === 'percent' || typeParam === 'amount' ? typeParam : undefined;

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isFetching } = useGetPaymentDiscountsQuery({ page, limit, isActive, discountType });
  const discounts: PaymentDiscount[] = data?.data.items ?? [];
  const total = data?.data.total ?? 0;
  const deleteMutation = useDeletePaymentDiscountMutation();

  const handleDelete = useCallback(
    (record: PaymentDiscount) => {
      Modal.confirm({
        title: 'Xác nhận xóa ưu đãi',
        content: `Bạn có chắc muốn xóa "${record.name ?? `ID ${record.discountId}`}"?`,
        okText: 'Xóa',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            const res = await deleteMutation.mutateAsync(record.discountId);
            message.success(res.message || 'Đã xóa ưu đãi');
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Xóa thất bại';
            message.error(msg);
          }
        },
      });
    },
    [deleteMutation],
  );

  const columns = useMemo<ColumnsType<PaymentDiscount>>(
    () => [
      {
        title: 'ID',
        dataIndex: 'discountId',
        key: 'discountId',
      },
      {
        title: 'Tên ưu đãi',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Loại',
        dataIndex: 'discountType',
        key: 'discountType',
        render: (value: PaymentDiscountType) =>
          value === 'percent' ? <Tag color="blue">Phần trăm</Tag> : <Tag color="purple">Số tiền</Tag>,
      },
      {
        title: 'Giá trị',
        key: 'discountValue',
        render: (_, record) => formatDiscountValue(record.discountType, Number(record.discountValue)),
      },
      {
        title: 'Phạm vi',
        key: 'scope',
        render: (_, record) => (
          <Flex vertical gap={2}>
            <span>{record.appliesAllServices ? 'Tất cả dịch vụ' : 'Theo dịch vụ chỉ định'}</span>
            <span>{record.appliesAllUsers ? 'Tất cả người dùng' : 'Theo người dùng chỉ định'}</span>
          </Flex>
        ),
      },
      {
        title: 'Hiệu lực',
        key: 'window',
        render: (_, record) => (
          <Flex vertical gap={2}>
            <span>Từ: {formatDateTime(record.startAt)}</span>
            <span>Đến: {formatDateTime(record.endAt)}</span>
          </Flex>
        ),
      },
      {
        title: 'Giới hạn/user',
        dataIndex: 'limitPerUser',
        key: 'limitPerUser',
        render: (value?: number | null) => (value == null ? 'Không giới hạn' : value),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (value: boolean) => (value ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng</Tag>),
      },
      {
        title: '',
        key: 'action',
        fixed: 'right',
        render: (_, record) => (
          <Flex gap={8} justify="center" align="center">
            <ModifyPaymentDiscount
              discountId={record.discountId}
              trigger={<Button variant="text" color="primary" icon={<Pencil size={16} />} />}
            />
            <Button
              danger
              type="text"
              icon={<Trash2 size={16} />}
              loading={deleteMutation.isPending}
              disabled={deleteMutation.isPending}
              onClick={() => handleDelete(record)}
            />
          </Flex>
        ),
      },
    ],
    [deleteMutation.isPending, handleDelete],
  );

  return (
    <Table
      rowKey="discountId"
      columns={columns}
      dataSource={discounts}
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

export default PaymentDiscountsTable;
