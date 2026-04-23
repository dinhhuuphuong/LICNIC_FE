import { Button, Flex, Input, Modal, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { SEARCH_PARAMS } from '@/constants/search-params';
import type { DoctorWorkSchedule } from '@/services/doctorWorkScheduleService';

import DATE_FORMAT from '@/constants/date-format';
import { DOCTOR_ROLE_ID } from '@/constants/roleIds';
import { useApproveDoctorWorkScheduleMutation } from '../hooks/mutations/useApproveDoctorWorkScheduleMutation';
import { useDeleteDoctorWorkScheduleMutation } from '../hooks/mutations/useDeleteDoctorWorkScheduleMutation';
import { useRejectDoctorWorkScheduleMutation } from '../hooks/mutations/useRejectDoctorWorkScheduleMutation';
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
  const approveMutation = useApproveDoctorWorkScheduleMutation();
  const rejectMutation = useRejectDoctorWorkScheduleMutation();

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

  const handleApprove = useCallback(
    (record: DoctorWorkSchedule) => {
      Modal.confirm({
        title: 'Xác nhận duyệt lịch làm việc',
        content: `Bạn có chắc muốn đồng ý lịch #${record.scheduleId}?`,
        okText: 'Đồng ý',
        cancelText: 'Hủy',
        onOk: async () => {
          try {
            const res = await approveMutation.mutateAsync(record.scheduleId);
            message.success(res.message || 'Đã duyệt lịch làm việc');
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Duyệt lịch thất bại';
            message.error(msg);
          }
        },
      });
    },
    [approveMutation],
  );

  const handleReject = useCallback(
    (record: DoctorWorkSchedule) => {
      let reason = '';

      Modal.confirm({
        title: 'Từ chối lịch làm việc',
        content: (
          <Input.TextArea
            autoFocus
            rows={4}
            placeholder="Nhập lý do từ chối"
            onChange={(event) => {
              reason = event.target.value;
            }}
          />
        ),
        okText: 'Từ chối',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: async () => {
          const trimmedReason = reason.trim();
          if (!trimmedReason) {
            message.warning('Vui lòng nhập lý do từ chối');
            throw new Error('Reject reason is required');
          }

          try {
            const res = await rejectMutation.mutateAsync({
              scheduleId: record.scheduleId,
              payload: { reason: trimmedReason },
            });
            message.success(res.message || 'Đã từ chối lịch làm việc');
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Từ chối lịch thất bại';
            message.error(msg);
            throw e;
          }
        },
      });
    },
    [rejectMutation],
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
            <Button
              disabled={
                record.status !== 'pending' || approveMutation.isPending || record.createdByRoleId !== DOCTOR_ROLE_ID
              }
              loading={approveMutation.isPending}
              variant="text"
              color="green"
              icon={<Check size={16} />}
              onClick={() => handleApprove(record)}
            />
            <Button
              disabled={
                record.status !== 'pending' || rejectMutation.isPending || record.createdByRoleId !== DOCTOR_ROLE_ID
              }
              loading={rejectMutation.isPending}
              variant="text"
              color="red"
              icon={<X size={16} />}
              onClick={() => handleReject(record)}
            />
            <ModifyDoctorWorkSchedule
              scheduleId={record.scheduleId}
              trigger={
                <Button
                  disabled={record.status !== 'pending'}
                  variant="text"
                  color="primary"
                  icon={<Pencil size={16} />}
                />
              }
            />
            <Button
              danger
              type="text"
              icon={<Trash2 size={16} />}
              loading={deleteMutation.isPending}
              disabled={deleteMutation.isPending || record.status !== 'pending'}
              onClick={() => handleDelete(record)}
            />
          </Flex>
        ),
      },
    ],
    [
      approveMutation.isPending,
      deleteMutation.isPending,
      handleApprove,
      handleDelete,
      handleReject,
      rejectMutation.isPending,
    ],
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
