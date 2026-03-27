import { Button, Flex, Modal, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { DEFAULT_AVATAR_URL } from '@/constants';
import { SEARCH_PARAMS } from '@/constants/search-params';
import { type Doctor } from '@/services/doctorService';

import { DOCTOR_SEARCH_PARAMS } from '../constants';
import { useDeleteDoctorMutation } from '../hooks/mutations/useDeleteDoctorMutation';
import { useGetDoctorsQuery } from '../hooks/queries/useGetDoctorsQuery';
import ModifyDoctor from './ModifyDoctor';

function formatCurrency(value: number) {
  if (Number.isNaN(value)) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN');
}

const DoctorsTable = () => {
  const [searchParams] = useSearchParams();

  const keyword = searchParams.get(SEARCH_PARAMS.KEYWORD) ?? undefined;
  const specialization = searchParams.get(DOCTOR_SEARCH_PARAMS.specialization) ?? undefined;
  const userStatus = searchParams.get(DOCTOR_SEARCH_PARAMS.userStatus) ?? undefined;

  const minExperienceYearsParam = searchParams.get(DOCTOR_SEARCH_PARAMS.minExperienceYears);
  const maxExperienceYearsParam = searchParams.get(DOCTOR_SEARCH_PARAMS.maxExperienceYears);
  const minConsultationFeeParam = searchParams.get(DOCTOR_SEARCH_PARAMS.minConsultationFee);
  const maxConsultationFeeParam = searchParams.get(DOCTOR_SEARCH_PARAMS.maxConsultationFee);

  const minExperienceYears = minExperienceYearsParam ? Number(minExperienceYearsParam) : undefined;
  const maxExperienceYears = maxExperienceYearsParam ? Number(maxExperienceYearsParam) : undefined;
  const minConsultationFee = minConsultationFeeParam ? Number(minConsultationFeeParam) : undefined;
  const maxConsultationFee = maxConsultationFeeParam ? Number(maxConsultationFeeParam) : undefined;

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isFetching } = useGetDoctorsQuery({
    page,
    limit,
    keyword,
    specialization,
    minExperienceYears,
    maxExperienceYears,
    minConsultationFee,
    maxConsultationFee,
    userStatus,
  });

  const doctors: Doctor[] = data?.data.items ?? [];
  const total = data?.data.total ?? 0;
  const deleteDoctorMutation = useDeleteDoctorMutation();

  const handleDelete = useCallback(
    (record: Doctor) => {
      Modal.confirm({
        title: 'Xác nhận xóa bác sĩ',
        content: `Bạn có chắc muốn xóa "${record.user?.name ?? record.user?.email ?? `ID ${record.doctorId}`}"?`,
        okText: 'Xóa',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            const res = await deleteDoctorMutation.mutateAsync(record.doctorId);
            message.success(res.message || 'Đã xóa bác sĩ');
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Xóa thất bại';
            message.error(msg);
          }
        },
      });
    },
    [deleteDoctorMutation],
  );

  const columns = useMemo<ColumnsType<Doctor>>(
    () => [
      {
        title: 'ID',
        dataIndex: 'doctorId',
        key: 'doctorId',
      },
      {
        title: 'Avatar',
        key: 'avatar',
        render: (_, record) => (
          <img
            src={record.user?.avatar ?? DEFAULT_AVATAR_URL}
            alt="avatar"
            style={{ width: 36, height: 36, borderRadius: '9999px', objectFit: 'cover' }}
            onError={(event) => {
              const img = event.currentTarget;
              img.onerror = null;
              img.src = DEFAULT_AVATAR_URL;
            }}
          />
        ),
      },
      {
        title: 'Họ và tên',
        key: 'name',
        render: (_, record) => record.user?.name ?? '',
      },
      {
        title: 'Email',
        key: 'email',
        render: (_, record) => record.user?.email ?? '',
      },
      {
        title: 'Số điện thoại',
        key: 'phone',
        render: (_, record) => record.user?.phone ?? '',
      },
      {
        title: 'Chuyên khoa',
        dataIndex: 'specialization',
        key: 'specialization',
      },
      {
        title: 'Kinh nghiệm (năm)',
        dataIndex: 'experienceYears',
        key: 'experienceYears',
      },
      {
        title: 'Phí tư vấn',
        dataIndex: 'consultationFee',
        key: 'consultationFee',
        render: (value) => formatCurrency(Number.parseFloat(String(value))),
      },
      {
        title: 'Trạng thái',
        key: 'status',
        render: (_, record) => record.user?.status ?? '',
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
            <ModifyDoctor
              doctorId={record.doctorId}
              trigger={<Button variant="text" color="primary" icon={<Pencil size={16} />} />}
            />
            <Button
              danger
              type="text"
              icon={<Trash2 size={16} />}
              loading={deleteDoctorMutation.isPending}
              disabled={deleteDoctorMutation.isPending}
              onClick={() => handleDelete(record)}
            />
          </Flex>
        ),
      },
    ],
    [deleteDoctorMutation.isPending, handleDelete],
  );

  return (
    <Table
      rowKey="doctorId"
      columns={columns}
      dataSource={doctors}
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
};

export default DoctorsTable;
