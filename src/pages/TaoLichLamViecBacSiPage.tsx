import { PageCard } from '@/components/common/PageCard';
import { StatePanel } from '@/components/common/StatePanel';
import DATE_FORMAT from '@/constants/date-format';
import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getClinicInfo } from '@/services/clinicInfoService';
import { createMyDoctorWorkSchedulesBatch } from '@/services/doctorWorkScheduleService';
import { useAuthStore } from '@/stores/authStore';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, Button, DatePicker, Form, InputNumber, TimePicker, message } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

type BatchScheduleFormItem = {
  workDate: dayjs.Dayjs;
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
  maxPatients: number;
  slotDurationMinutes: number;
};

const DEFAULT_BATCH_ITEM: BatchScheduleFormItem = {
  workDate: dayjs().add(1, 'day'),
  startTime: dayjs('08:00', 'HH:mm'),
  endTime: dayjs('12:00', 'HH:mm'),
  maxPatients: 20,
  slotDurationMinutes: 30,
};

type WorkingRange = {
  start: string;
  end: string;
};

const WEEKDAY_RANGE: WorkingRange = { start: '08:00', end: '20:00' };
const WEEKEND_RANGE: WorkingRange = { start: '08:00', end: '17:00' };

const DAY_LABEL_TO_INDEX: Record<string, number> = {
  CN: 0,
  T2: 1,
  T3: 2,
  T4: 3,
  T5: 4,
  T6: 5,
  T7: 6,
};

function buildDefaultWorkingRangeMap() {
  return {
    0: WEEKEND_RANGE,
    1: WEEKDAY_RANGE,
    2: WEEKDAY_RANGE,
    3: WEEKDAY_RANGE,
    4: WEEKDAY_RANGE,
    5: WEEKDAY_RANGE,
    6: WEEKEND_RANGE,
  } as Record<number, WorkingRange>;
}

function parseWorkingHours(workingHours?: string | null) {
  const byDay = buildDefaultWorkingRangeMap();
  if (!workingHours) return byDay;

  const segments = workingHours
    .split(';')
    .map((segment) => segment.trim())
    .filter(Boolean);

  for (const segment of segments) {
    const parts = segment.split(':');
    if (parts.length < 2) continue;

    const dayPart = parts[0].trim().toUpperCase();
    const timePart = parts.slice(1).join(':').trim();
    const timeMatch = /([0-2]\d:[0-5]\d)-([0-2]\d:[0-5]\d)/.exec(timePart);
    if (!timeMatch) continue;

    const range: WorkingRange = { start: timeMatch[1], end: timeMatch[2] };

    if (dayPart.includes('-')) {
      const [fromLabelRaw, toLabelRaw] = dayPart.split('-');
      const fromLabel = fromLabelRaw.trim();
      const toLabel = toLabelRaw.trim();
      const from = DAY_LABEL_TO_INDEX[fromLabel];
      const to = DAY_LABEL_TO_INDEX[toLabel];
      if (from == null || to == null) continue;

      if (from <= to) {
        for (let day = from; day <= to; day += 1) {
          byDay[day] = range;
        }
      } else {
        for (let day = from; day <= 6; day += 1) byDay[day] = range;
        for (let day = 0; day <= to; day += 1) byDay[day] = range;
      }
      continue;
    }

    const day = DAY_LABEL_TO_INDEX[dayPart];
    if (day != null) {
      byDay[day] = range;
    }
  }

  return byDay;
}

function getWorkingRangeByDate(workDate: dayjs.Dayjs, workingHours?: string | null): WorkingRange {
  const byDay = parseWorkingHours(workingHours);
  return byDay[workDate.day()] ?? WEEKDAY_RANGE;
}

export function TaoLichLamViecBacSiPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [form] = Form.useForm<{ items: BatchScheduleFormItem[] }>();
  const clinicInfoQuery = useQuery({
    queryKey: ['clinicInfo'],
    queryFn: getClinicInfo,
  });

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Tạo lịch làm việc' : 'NHA KHOA TAN TAM | Create work schedules');

  const createBatchMutation = useMutation({
    mutationFn: async (values: { items: BatchScheduleFormItem[] }) =>
      await createMyDoctorWorkSchedulesBatch({
        items: values.items.map((item) => ({
          workDate: item.workDate.format(DATE_FORMAT.DB_DATE),
          startTime: item.startTime.format('HH:mm'),
          endTime: item.endTime.format('HH:mm'),
          maxPatients: Number(item.maxPatients),
          slotDurationMinutes: Number(item.slotDurationMinutes),
        })),
      }),
  });

  const handleSubmitBatch = async (values: { items: BatchScheduleFormItem[] }) => {
    if (!values.items?.length) {
      return;
    }

    createBatchMutation.mutateAsync(values, {
      onSuccess: () => {
        message.success(isVi ? 'Tạo lịch làm việc thành công.' : 'Work schedules created successfully.');
        navigate(ROUTES.doctorWorkSchedules);
      },
      onError: (error) => {
        console.log(
          error instanceof Error
            ? error.message
            : isVi
              ? 'Tạo lịch làm việc thất bại.'
              : 'Failed to create work schedules.',
        );
        message.error(
          error instanceof Error
            ? error.message
            : isVi
              ? 'Tạo lịch làm việc thất bại.'
              : 'Failed to create work schedules.',
        );
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
        description={isVi ? 'Vui lòng đăng nhập để tạo lịch làm việc.' : 'Please sign in to create work schedules.'}
        action={
          <Button type="primary" size="large" className="rounded-full" onClick={() => navigate(ROUTES.login)}>
            {isVi ? 'Đăng nhập' : 'Login'}
          </Button>
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
          <Button type="link" className="px-0 text-sm font-semibold" onClick={() => navigate(ROUTES.home)}>
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1360px]">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Tạo lịch làm việc' : 'Create work schedules'}</h1>
        <Button
          className="h-10 rounded-full px-5 text-sm font-bold"
          onClick={() => navigate(ROUTES.doctorWorkSchedules)}
        >
          {isVi ? 'Về danh sách lịch' : 'Back to schedules'}
        </Button>
      </header>

      <PageCard>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ items: [{ ...DEFAULT_BATCH_ITEM }] }}
          onFinish={handleSubmitBatch}
        >
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-slate-900">
                    {isVi ? 'Danh sách lịch cần tạo' : 'Schedules to create'}
                  </h2>
                  <Button icon={<PlusOutlined />} onClick={() => add({ ...DEFAULT_BATCH_ITEM })}>
                    {isVi ? 'Thêm dòng' : 'Add row'}
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.key} className="rounded-2xl border border-slate-200 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">
                        {isVi ? 'Lịch #' : 'Schedule #'}
                        {index + 1}
                      </p>
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        disabled={fields.length === 1}
                        onClick={() => remove(field.name)}
                      >
                        {isVi ? 'Xóa' : 'Remove'}
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-5">
                      <Form.Item
                        name={[field.name, 'workDate']}
                        label={isVi ? 'Ngày làm việc' : 'Work date'}
                        rules={[{ required: true, message: isVi ? 'Vui lòng chọn ngày' : 'Please select date' }]}
                      >
                        <DatePicker className="w-full" format={DATE_FORMAT.DATE} minDate={dayjs().add(1, 'day')} />
                      </Form.Item>

                      <Form.Item
                        name={[field.name, 'startTime']}
                        label={isVi ? 'Bắt đầu' : 'Start'}
                        dependencies={[['items', field.name, 'workDate']]}
                        rules={[
                          { required: true, message: isVi ? 'Vui lòng chọn giờ bắt đầu' : 'Please select start time' },
                          {
                            validator: async (_, value: dayjs.Dayjs | null) => {
                              const workDate = form.getFieldValue([
                                'items',
                                field.name,
                                'workDate',
                              ]) as dayjs.Dayjs | null;
                              if (!value || !workDate) return;
                              const range = getWorkingRangeByDate(workDate, clinicInfoQuery.data?.data.workingHours);
                              const valueTime = value.format('HH:mm');
                              if (valueTime >= range.start && valueTime < range.end) return;
                              throw new Error(
                                isVi
                                  ? `Giờ bắt đầu phải trong khung ${range.start}-${range.end}.`
                                  : `Start time must be within ${range.start}-${range.end}.`,
                              );
                            },
                          },
                        ]}
                      >
                        <TimePicker className="w-full" format="HH:mm" />
                      </Form.Item>

                      <Form.Item
                        name={[field.name, 'endTime']}
                        label={isVi ? 'Kết thúc' : 'End'}
                        dependencies={[
                          ['items', field.name, 'workDate'],
                          ['items', field.name, 'startTime'],
                        ]}
                        rules={[
                          { required: true, message: isVi ? 'Vui lòng chọn giờ kết thúc' : 'Please select end time' },
                          {
                            validator: async (_, value: dayjs.Dayjs | null) => {
                              const start = form.getFieldValue([
                                'items',
                                field.name,
                                'startTime',
                              ]) as dayjs.Dayjs | null;
                              const workDate = form.getFieldValue([
                                'items',
                                field.name,
                                'workDate',
                              ]) as dayjs.Dayjs | null;
                              if (!value || !start || !workDate) return;

                              const range = getWorkingRangeByDate(workDate, clinicInfoQuery.data?.data.workingHours);
                              const endTime = value.format('HH:mm');
                              const startTime = start.format('HH:mm');

                              if (endTime <= startTime) {
                                throw new Error(
                                  isVi
                                    ? 'Giờ kết thúc phải lớn hơn giờ bắt đầu.'
                                    : 'End time must be greater than start time.',
                                );
                              }

                              if (endTime > range.end || endTime <= range.start) {
                                throw new Error(
                                  isVi
                                    ? `Giờ kết thúc phải trong khung ${range.start}-${range.end}.`
                                    : `End time must be within ${range.start}-${range.end}.`,
                                );
                              }
                            },
                          },
                        ]}
                      >
                        <TimePicker className="w-full" format="HH:mm" />
                      </Form.Item>

                      <Form.Item
                        name={[field.name, 'maxPatients']}
                        label={isVi ? 'Tối đa bệnh nhân' : 'Max patients'}
                        rules={[{ required: true, message: isVi ? 'Vui lòng nhập số lượng' : 'Please enter value' }]}
                      >
                        <InputNumber min={1} className="w-full" />
                      </Form.Item>

                      <Form.Item
                        name={[field.name, 'slotDurationMinutes']}
                        label={isVi ? 'Thời lượng slot (phút)' : 'Slot duration (minutes)'}
                        rules={[{ required: true, message: isVi ? 'Vui lòng nhập số phút' : 'Please enter minutes' }]}
                      >
                        <InputNumber min={1} className="w-full" />
                      </Form.Item>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Form.List>

          {clinicInfoQuery.data?.data.workingHours ? (
            <Alert
              className="my-4"
              type="info"
              message={`${isVi ? 'Khung giờ phòng khám:' : 'Clinic working hours:'} ${clinicInfoQuery.data.data.workingHours}`}
              showIcon
            />
          ) : null}

          <Button type="primary" htmlType="submit" loading={createBatchMutation.isPending}>
            {isVi ? 'Tạo lịch làm việc' : 'Create work schedules'}
          </Button>
        </Form>
      </PageCard>
    </div>
  );
}
