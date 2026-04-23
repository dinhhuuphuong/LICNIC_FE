import { PageCard } from '@/components/common/PageCard';
import { StatePanel } from '@/components/common/StatePanel';
import RangePickerParam from '@/components/common/date-pickers/range-picker-param';
import { EditDoctorWorkScheduleModal } from '@/components/doctor-work-schedules/EditDoctorWorkScheduleModal';
import DATE_FORMAT from '@/constants/date-format';
import ROLE from '@/constants/role';
import { ADMIN_ROLE_ID } from '@/constants/roleIds';
import { ROUTES } from '@/constants/routes';
import { SEARCH_PARAMS } from '@/constants/search-params';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getClinicInfo } from '@/services/clinicInfoService';
import { getDoctors } from '@/services/doctorService';
import {
  approveDoctorWorkSchedule,
  deleteMyDoctorWorkSchedule,
  getDoctorWorkScheduleDetail,
  getDoctorWorkSchedulesFromStore,
  rejectDoctorWorkSchedule,
  updateDoctorWorkScheduleForDoctor,
} from '@/services/doctorWorkScheduleService';
import { useAuthStore } from '@/stores/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Modal, Pagination, message } from 'antd';
import dayjs from 'dayjs';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryParam } from 'use-query-params';

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

function getStatusBadgeClass(status: string) {
  if (status === 'approved') return 'rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700';
  if (status === 'rejected') return 'rounded-full bg-red-50 px-3 py-1 font-semibold text-red-700';
  if (status === 'pending') return 'rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700';
  return 'rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700';
}

export function LichLamViecBacSiPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [fromDateParam] = useQueryParam<string | undefined>(SEARCH_PARAMS.FROM_DATE);
  const [toDateParam] = useQueryParam<string | undefined>(SEARCH_PARAMS.TO_DATE);
  const [rejectingScheduleId, setRejectingScheduleId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editForm] = Form.useForm();

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Lịch làm việc bác sĩ' : 'NHA KHOA TAN TAM | Doctor work schedules');

  const fromDate = fromDateParam ?? dayjs().startOf('month').format(DATE_FORMAT.DB_DATE);
  const toDate = toDateParam ?? dayjs().endOf('month').format(DATE_FORMAT.DB_DATE);

  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate]);

  const doctorMeQuery = useQuery({
    queryKey: ['doctorProfileByUser', user?.userId],
    queryFn: async () => {
      const res = await getDoctors({ page: 1, limit: 1000 });
      return res.data.items.find((item) => item.userId === user?.userId) ?? null;
    },
    enabled: !!user && normalizeRoleName(user.role?.roleName) === ROLE.DOCTOR.toLowerCase(),
  });

  const clinicInfoQuery = useQuery({
    queryKey: ['clinicInfo'],
    queryFn: getClinicInfo,
  });

  const schedulesQuery = useQuery({
    queryKey: ['doctorMySchedules', doctorMeQuery.data?.doctorId, fromDate, toDate, currentPage, pageSize],
    queryFn: async () =>
      getDoctorWorkSchedulesFromStore({
        page: currentPage,
        limit: pageSize,
        doctorId: doctorMeQuery.data?.doctorId,
        fromDate,
        toDate,
      }),
    enabled: !!doctorMeQuery.data?.doctorId,
  });

  const scheduleDetailQuery = useQuery({
    queryKey: ['doctorWorkScheduleDetail', editingScheduleId],
    queryFn: () => {
      if (!editingScheduleId) {
        throw new Error('Missing scheduleId');
      }
      return getDoctorWorkScheduleDetail(editingScheduleId);
    },
    enabled: editingScheduleId !== null,
  });

  useEffect(() => {
    if (!editingScheduleId || !scheduleDetailQuery.data?.data) return;
    const detail = scheduleDetailQuery.data.data;
    editForm.setFieldsValue({
      startTime: detail.startTime ? dayjs(detail.startTime, 'HH:mm:ss') : undefined,
      endTime: detail.endTime ? dayjs(detail.endTime, 'HH:mm:ss') : undefined,
      maxPatients: detail.maxPatients ?? undefined,
      slotDurationMinutes: detail.slotDurationMinutes ?? undefined,
    });
  }, [editingScheduleId, scheduleDetailQuery.data, editForm]);

  const approveMutation = useMutation({
    mutationFn: (scheduleId: number) => approveDoctorWorkSchedule(scheduleId),
    onSuccess: (res) => {
      message.success(res.message || (isVi ? 'Đã duyệt lịch làm việc' : 'Schedule approved'));
      void queryClient.invalidateQueries({ queryKey: ['doctorMySchedules'] });
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : isVi ? 'Duyệt lịch thất bại' : 'Approve failed');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ scheduleId, reason }: { scheduleId: number; reason: string }) =>
      rejectDoctorWorkSchedule(scheduleId, { reason }),
    onSuccess: (res) => {
      message.success(res.message || (isVi ? 'Đã từ chối lịch làm việc' : 'Schedule rejected'));
      setRejectingScheduleId(null);
      setRejectReason('');
      void queryClient.invalidateQueries({ queryKey: ['doctorMySchedules'] });
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : isVi ? 'Từ chối lịch thất bại' : 'Reject failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (scheduleId: number) => deleteMyDoctorWorkSchedule(scheduleId),
    onSuccess: (res) => {
      message.success(res.message || (isVi ? 'Đã xóa lịch làm việc' : 'Schedule deleted'));
      void queryClient.invalidateQueries({ queryKey: ['doctorMySchedules'] });
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : isVi ? 'Xóa lịch thất bại' : 'Delete failed');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      scheduleId,
      payload,
    }: {
      scheduleId: number;
      payload: {
        startTime: string;
        endTime: string;
        maxPatients: number;
        slotDurationMinutes: number;
      };
    }) => updateDoctorWorkScheduleForDoctor(scheduleId, payload),
    onSuccess: (res) => {
      message.success(res.message || (isVi ? 'Đã cập nhật lịch làm việc' : 'Schedule updated'));
      setEditingScheduleId(null);
      editForm.resetFields();
      void queryClient.invalidateQueries({ queryKey: ['doctorMySchedules'] });
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : isVi ? 'Cập nhật thất bại' : 'Update failed');
    },
  });

  const handleApprove = (scheduleId: number) => {
    Modal.confirm({
      title: isVi ? 'Xác nhận duyệt lịch làm việc' : 'Confirm schedule approval',
      content: isVi
        ? 'Bạn có chắc muốn đồng ý lịch làm việc này không?'
        : 'Are you sure you want to approve this schedule?',
      okText: isVi ? 'Đồng ý' : 'Approve',
      cancelText: isVi ? 'Hủy' : 'Cancel',
      onOk: async () => {
        await approveMutation.mutateAsync(scheduleId);
      },
    });
  };

  const handleOpenRejectModal = (scheduleId: number) => {
    setRejectingScheduleId(scheduleId);
    setRejectReason('');
  };

  const handleDelete = (scheduleId: number) => {
    Modal.confirm({
      title: isVi ? 'Xác nhận xóa lịch làm việc' : 'Confirm schedule deletion',
      content: isVi
        ? 'Bạn có chắc muốn xóa lịch làm việc này không?'
        : 'Are you sure you want to delete this schedule?',
      okText: isVi ? 'Xóa' : 'Delete',
      okButtonProps: { danger: true },
      cancelText: isVi ? 'Hủy' : 'Cancel',
      onOk: async () => {
        await deleteMutation.mutateAsync(scheduleId);
      },
    });
  };

  const handleReject = async () => {
    if (!rejectingScheduleId) return;
    const reason = rejectReason.trim();
    if (!reason) {
      message.warning(isVi ? 'Vui lòng nhập lý do từ chối' : 'Please enter reject reason');
      return;
    }
    await rejectMutation.mutateAsync({ scheduleId: rejectingScheduleId, reason });
  };

  const handleOpenEditModal = (scheduleId: number) => {
    setEditingScheduleId(scheduleId);
    editForm.resetFields();
  };

  const handleSubmitEdit = async () => {
    if (!editingScheduleId) return;
    const values = await editForm.validateFields();
    await updateMutation.mutateAsync({
      scheduleId: editingScheduleId,
      payload: {
        startTime: dayjs(values.startTime).format('HH:mm'),
        endTime: dayjs(values.endTime).format('HH:mm'),
        maxPatients: Number(values.maxPatients),
        slotDurationMinutes: Number(values.slotDurationMinutes),
      },
    });
  };

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={isVi ? 'Vui lòng đăng nhập để xem lịch làm việc.' : 'Please sign in to view your work schedules.'}
        action={
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white"
            onClick={() => navigate(ROUTES.login)}
          >
            {isVi ? 'Đăng nhập' : 'Login'}
          </button>
        }
      />
    );
  }

  if (normalizeRoleName(user.role?.roleName) !== ROLE.DOCTOR.toLowerCase()) {
    return (
      <StatePanel
        centered
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không có quyền truy cập' : 'Access denied'}
        description={
          isVi ? 'Trang này chỉ dành cho tài khoản bác sĩ.' : 'This page is only available for doctor accounts.'
        }
        action={
          <button
            type="button"
            className="text-sm font-semibold text-blue-600 underline"
            onClick={() => navigate(ROUTES.home)}
          >
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </button>
        }
      />
    );
  }

  if (doctorMeQuery.isLoading || schedulesQuery.isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-slate-200" />
        <div className="h-40 rounded-2xl bg-slate-100" />
        <div className="h-40 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (doctorMeQuery.isError) {
    return (
      <StatePanel
        tone="danger"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không tải được hồ sơ bác sĩ' : 'Could not load doctor profile'}
        description={doctorMeQuery.error instanceof Error ? doctorMeQuery.error.message : 'Error'}
      />
    );
  }

  if (!doctorMeQuery.data) {
    return (
      <StatePanel
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Chưa tìm thấy hồ sơ bác sĩ' : 'Doctor profile not found'}
        description={
          isVi
            ? 'Tài khoản này chưa được gắn với bản ghi bác sĩ trong hệ thống.'
            : 'This account is not linked to a doctor record yet.'
        }
      />
    );
  }

  if (schedulesQuery.isError) {
    return (
      <StatePanel
        tone="danger"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không tải được lịch làm việc' : 'Could not load work schedules'}
        description={schedulesQuery.error instanceof Error ? schedulesQuery.error.message : 'Error'}
      />
    );
  }

  const schedules = schedulesQuery.data?.data.items ?? [];
  const totalSchedules = schedulesQuery.data?.data.total ?? 0;

  return (
    <div className="mx-auto w-full max-w-[1360px]">
      <header className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-0">{isVi ? 'Lịch làm việc' : 'Work schedules'}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <RangePickerParam
              allowClear={false}
              dbFormat={DATE_FORMAT.DB_DATE}
              placeholder={isVi ? ['Từ ngày', 'Đến ngày'] : ['From date', 'To date']}
              defaultValue={[dayjs(fromDate, DATE_FORMAT.DB_DATE), dayjs(toDate, DATE_FORMAT.DB_DATE)]}
            />
            <Button icon={<Plus />} onClick={() => navigate('/bac-si/lich-lam-viec/tao-moi')} type="primary">
              {isVi ? 'Tạo lịch làm việc' : 'Create schedules'}
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-4">
        {schedules.length === 0 ? (
          <PageCard>
            <p className="text-sm text-slate-600">
              {isVi
                ? 'Hiện chưa có lịch làm việc trong khoảng thời gian này.'
                : 'No work schedules found for this period.'}
            </p>
          </PageCard>
        ) : (
          schedules.map((schedule) => (
            <PageCard key={schedule.scheduleId}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {dayjs(schedule.workDate).format(DATE_FORMAT.DATE)}
                  </p>
                  <p className="text-sm text-slate-600">
                    {schedule.startTime} - {schedule.endTime}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className={getStatusBadgeClass(schedule.status)}>
                    {isVi ? 'Trạng thái:' : 'Status:'} {schedule.status}
                  </span>
                  {schedule.maxPatients != null ? (
                    <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                      {isVi ? 'Tối đa:' : 'Max patients:'} {schedule.maxPatients}
                    </span>
                  ) : null}
                  {schedule.slotDurationMinutes != null ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                      {isVi ? 'Mỗi lượt:' : 'Slot:'} {schedule.slotDurationMinutes} phút
                    </span>
                  ) : null}
                </div>
              </div>
              {schedule.status === 'rejected' && schedule.rejectionReason ? (
                <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span className="font-semibold">{isVi ? 'Lý do từ chối:' : 'Rejection reason:'}</span>{' '}
                  {schedule.rejectionReason}
                </div>
              ) : null}
              <div className="flex justify-end items-center gap-2 mt-2">
                {schedule.status === 'pending' && (
                  <Button
                    onClick={() => handleOpenEditModal(schedule.scheduleId)}
                    disabled={approveMutation.isPending || rejectMutation.isPending || deleteMutation.isPending}
                  >
                    {isVi ? 'Sửa' : 'Edit'}
                  </Button>
                )}
                {schedule.status === 'pending' && schedule.createdByRoleId === ADMIN_ROLE_ID ? (
                  <>
                    <Button
                      type="primary"
                      loading={approveMutation.isPending}
                      disabled={rejectMutation.isPending || deleteMutation.isPending}
                      onClick={() => handleApprove(schedule.scheduleId)}
                    >
                      {isVi ? 'Đồng ý' : 'Approve'}
                    </Button>
                    <Button
                      danger
                      loading={rejectMutation.isPending && rejectingScheduleId === schedule.scheduleId}
                      disabled={approveMutation.isPending || deleteMutation.isPending}
                      onClick={() => handleOpenRejectModal(schedule.scheduleId)}
                    >
                      {isVi ? 'Từ chối' : 'Reject'}
                    </Button>
                  </>
                ) : null}
                {schedule.status === 'pending' && (
                  <Button
                    danger
                    loading={deleteMutation.isPending}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    onClick={() => handleDelete(schedule.scheduleId)}
                  >
                    {isVi ? 'Xóa' : 'Delete'}
                  </Button>
                )}
              </div>
            </PageCard>
          ))
        )}
      </div>
      {totalSchedules > 0 ? (
        <div className="mt-6 flex justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalSchedules}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
            showTotal={(total, range) =>
              isVi ? `${range[0]}-${range[1]} / ${total} lịch` : `${range[0]}-${range[1]} of ${total} schedules`
            }
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
          />
        </div>
      ) : null}
      <Modal
        title={isVi ? 'Từ chối lịch làm việc' : 'Reject work schedule'}
        open={rejectingScheduleId !== null}
        okText={isVi ? 'Xác nhận từ chối' : 'Confirm reject'}
        cancelText={isVi ? 'Hủy' : 'Cancel'}
        onOk={() => void handleReject()}
        onCancel={() => {
          setRejectingScheduleId(null);
          setRejectReason('');
        }}
        confirmLoading={rejectMutation.isPending}
      >
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
          placeholder={isVi ? 'Nhập lý do từ chối...' : 'Enter reject reason...'}
        />
      </Modal>
      <EditDoctorWorkScheduleModal
        isVi={isVi}
        open={editingScheduleId !== null}
        form={editForm}
        confirmLoading={updateMutation.isPending}
        detailLoading={scheduleDetailQuery.isLoading}
        workDate={scheduleDetailQuery.data?.data.workDate}
        clinicWorkingHours={clinicInfoQuery.data?.data.workingHours}
        onSubmit={() => void handleSubmitEdit()}
        onCancel={() => {
          setEditingScheduleId(null);
          editForm.resetFields();
        }}
      />
    </div>
  );
}
