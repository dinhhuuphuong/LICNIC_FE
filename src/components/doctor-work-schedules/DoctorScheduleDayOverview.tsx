import { EditDoctorWorkScheduleModal } from '@/components/doctor-work-schedules/EditDoctorWorkScheduleModal';
import DATE_FORMAT from '@/constants/date-format';
import { getDoctorAppointmentDetailRoute } from '@/constants/routes';
import { ADMIN_ROLE_ID } from '@/constants/roleIds';
import { getAppointments } from '@/services/appointmentService';
import { getClinicInfo } from '@/services/clinicInfoService';
import {
  approveDoctorWorkSchedule,
  deleteMyDoctorWorkSchedule,
  getDoctorWorkScheduleDetail,
  rejectDoctorWorkSchedule,
  updateDoctorWorkScheduleForDoctor,
  type DoctorWorkSchedule,
} from '@/services/doctorWorkScheduleService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Modal, message } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { DoctorScheduleAppointmentsSection } from './DoctorScheduleAppointmentsSection';
import { DoctorScheduleRejectionReason } from './DoctorScheduleRejectionReason';

type DoctorScheduleDayOverviewProps = {
  doctorId: number;
  isVi: boolean;
  selectedDate: string;
  schedules: DoctorWorkSchedule[];
};

function getScheduleStatusStyle(status: DoctorWorkSchedule['status']) {
  if (status === 'approved') return 'bg-emerald-500';
  if (status === 'rejected') return 'bg-red-500';
  return 'bg-amber-500';
}

export function DoctorScheduleDayOverview(props: DoctorScheduleDayOverviewProps) {
  const { doctorId, isVi, selectedDate, schedules } = props;
  const queryClient = useQueryClient();

  const [rejectingScheduleId, setRejectingScheduleId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const [editForm] = Form.useForm();

  const clinicInfoQuery = useQuery({
    queryKey: ['clinicInfo'],
    queryFn: getClinicInfo,
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

  useMemo(() => {
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
      void queryClient.invalidateQueries({ queryKey: ['doctorMonthlySchedulesV2'] });
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
      void queryClient.invalidateQueries({ queryKey: ['doctorMonthlySchedulesV2'] });
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
      void queryClient.invalidateQueries({ queryKey: ['doctorMonthlySchedulesV2'] });
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
      void queryClient.invalidateQueries({ queryKey: ['doctorMonthlySchedulesV2'] });
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

  const appointmentsQuery = useQuery({
    queryKey: ['doctorScheduleDayOverviewAppointments', doctorId, selectedDate],
    queryFn: () =>
      getAppointments({
        doctorId,
        fromDate: selectedDate,
        toDate: selectedDate,
        page: 1,
        limit: 200,
      }),
    enabled: !!doctorId,
  });

  const sortedAppointments = useMemo(() => {
    const items = appointmentsQuery.data?.data.items ?? [];
    return [...items].sort((a, b) => {
      const dateCmp = a.appointmentDate.localeCompare(b.appointmentDate);
      if (dateCmp !== 0) return dateCmp;
      return a.appointmentTime.localeCompare(b.appointmentTime);
    });
  }, [appointmentsQuery.data]);

  const appointmentsSectionTitle = isVi ? 'Lịch hẹn' : 'Appointments';
  const appointmentsLoadingLabel = isVi ? 'Đang tải lịch hẹn…' : 'Loading appointments…';
  const appointmentsEmptyLabel = isVi ? 'Không có lịch hẹn trong ngày này.' : 'No appointments on this date.';

  return (
    <div className="p-4">
      <div className="mb-3 text-base font-semibold text-slate-800">
        {dayjs(selectedDate, DATE_FORMAT.DB_DATE).format(DATE_FORMAT.DATE)}
      </div>
      <div className="rounded border border-slate-200 bg-slate-50 p-4 text-sm">
        <div className="text-slate-600">
          {isVi ? `Tổng số ca trong ngày: ${schedules.length}` : `Total shifts in day: ${schedules.length}`}
        </div>
        {schedules.length === 0 ? (
          <p className="mt-2 text-slate-500">
            {isVi ? 'Không có ca làm việc cho ngày này.' : 'No work shifts found for this day.'}
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {schedules.map((schedule) => (
              <div key={schedule.scheduleId} className="rounded border border-slate-200 bg-white px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-800">
                    {schedule.startTime} - {schedule.endTime}
                  </div>
                  <span
                    className={[
                      'rounded-full px-2 py-0.5 text-xs text-white',
                      getScheduleStatusStyle(schedule.status),
                    ].join(' ')}
                  >
                    {schedule.status}
                  </span>
                </div>
                {schedule.status === 'rejected' ? (
                  <DoctorScheduleRejectionReason isVi={isVi} rejectionReason={schedule.rejectionReason} />
                ) : null}

                <div className="mt-2 flex items-center justify-end gap-2">
                  {schedule.status === 'pending' && (
                    <Button
                      size="small"
                      onClick={() => handleOpenEditModal(schedule.scheduleId)}
                      disabled={
                        approveMutation.isPending || rejectMutation.isPending || deleteMutation.isPending
                      }
                    >
                      {isVi ? 'Sửa' : 'Edit'}
                    </Button>
                  )}
                  {schedule.status === 'pending' && schedule.createdByRoleId === ADMIN_ROLE_ID ? (
                    <>
                      <Button
                        size="small"
                        type="primary"
                        loading={approveMutation.isPending}
                        disabled={rejectMutation.isPending || deleteMutation.isPending}
                        onClick={() => handleApprove(schedule.scheduleId)}
                      >
                        {isVi ? 'Đồng ý' : 'Approve'}
                      </Button>
                      <Button
                        size="small"
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
                      size="small"
                      danger
                      loading={deleteMutation.isPending}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      onClick={() => handleDelete(schedule.scheduleId)}
                    >
                      {isVi ? 'Xóa' : 'Delete'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DoctorScheduleAppointmentsSection
        isVi={isVi}
        isLoading={appointmentsQuery.isLoading}
        isError={appointmentsQuery.isError}
        error={appointmentsQuery.error}
        appointments={sortedAppointments}
        sectionTitle={appointmentsSectionTitle}
        loadingLabel={appointmentsLoadingLabel}
        emptyLabel={appointmentsEmptyLabel}
        appointmentDetailHref={getDoctorAppointmentDetailRoute}
      />

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
