import { Button, Flex, Modal, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { SEARCH_PARAMS } from '@/constants/search-params';
import type { DoctorWorkSchedule } from '@/services/doctorWorkScheduleService';

import DATE_FORMAT from '@/constants/date-format';
import { useDeleteDoctorWorkScheduleMutation } from '../hooks/mutations/useDeleteDoctorWorkScheduleMutation';
import { useGetDoctorWorkSchedulesQuery } from '../hooks/queries/useGetDoctorWorkSchedulesQuery';
import ModifyDoctorWorkSchedule from './ModifyDoctorWorkSchedule';

function renderStatusTag(status: DoctorWorkSchedule['status']) {
  if (status === 'approved') return <Tag color="green">approved</Tag>;
  if (status === 'rejected') return <Tag color="red">rejected</Tag>;
  return <Tag color="gold">pending</Tag>;
}

export default function DoctorWorkSchedulesTable() {
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get(SEARCH_PARAMS.DOCTOR_ID)
    ? Number(searchParams.get(SEARCH_PARAMS.DOCTOR_ID))
    : undefined;
  const fromDate = searchParams.get(SEARCH_PARAMS.FROM_DATE) ?? dayjs().startOf('month').format(DATE_FORMAT.DB_DATE);
  const toDate = searchParams.get(SEARCH_PARAMS.TO_DATE) ?? dayjs().endOf('month').format(DATE_FORMAT.DB_DATE);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isFetching } = useGetDoctorWorkSchedulesQuery({ page, limit, doctorId, fromDate, toDate });
  const items: DoctorWorkSchedule[] = data?.data.items ?? [];
  const total = data?.data.total ?? 0;

  const deleteMutation = useDeleteDoctorWorkScheduleMutation();

  const handleDelete = useCallback(
    (record: DoctorWorkSchedule) => {
      Modal.confirm({
        title: 'Xác nhận xóa lịch làm việc',
        content: `Bạn có chắc muốn xóa lịch #${record.scheduleId}?`,
        okText: 'Xóa',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            const res = await deleteMutation.mutateAsync(record.scheduleId);
            message.success(res.message || 'Đã xóa lịch làm việc');
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Xóa thất bại';
            message.error(msg);
          }
        },
      });
    },
    [deleteMutation],
  );

  const columns = useMemo<ColumnsType<DoctorWorkSchedule>>(
    () => [
      {
        title: 'ID',
        dataIndex: 'scheduleId',
        key: 'scheduleId',
        fixed: 'left',
      },
      {
        title: 'Bác sĩ',
        key: 'doctor',
        render: (_, r) => r.doctor?.user?.name ?? `doctorId=${r.doctorId}`,
      },
      {
        title: 'Ngày',
        dataIndex: 'workDate',
        key: 'workDate',
        render: (v) => dayjs(v).format(DATE_FORMAT.DATE),
      },
      {
        title: 'Giờ',
        key: 'time',
        render: (_, r) => `${r.startTime} - ${r.endTime}`,
      },
      {
        title: 'Tối đa BN',
        dataIndex: 'maxPatients',
        key: 'maxPatients',
      },
      {
        title: 'Slot (phút)',
        dataIndex: 'slotDurationMinutes',
        key: 'slotDurationMinutes',
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (v) => renderStatusTag(v),
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (v) => dayjs(v).format(DATE_FORMAT.DATE_TIME),
      },
      {
        title: '',
        key: 'action',
        fixed: 'right',
        render: (_, record) => (
          <Flex gap={8} justify="center" align="center">
            <ModifyDoctorWorkSchedule
              scheduleId={record.scheduleId}
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
      rowKey="scheduleId"
      columns={columns}
      dataSource={items}
      loading={isFetching}
      scroll={{ x: 'max-content' }}
      pagination={{
        current: page,
        pageSize: limit,
        total,
        showSizeChanger: false,
        onChange: (nextPage) => setPage(nextPage),
      }}
    />
  );
}
