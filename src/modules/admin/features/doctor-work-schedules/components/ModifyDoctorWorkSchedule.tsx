import { Button, Col, DatePicker, Form, InputNumber, message, Modal, Row, TimePicker } from 'antd';
import dayjs from 'dayjs';
import type { ReactElement } from 'react';
import { cloneElement, useEffect, useMemo, useState } from 'react';

import type {
  CreateDoctorWorkSchedulePayload,
  DoctorWorkSchedule,
  UpdateDoctorWorkSchedulePayload,
} from '@/services/doctorWorkScheduleService';

import DATE_FORMAT from '@/constants/date-format';
import { useCreateDoctorWorkScheduleMutation } from '../hooks/mutations/useCreateDoctorWorkScheduleMutation';
import { useUpdateDoctorWorkScheduleMutation } from '../hooks/mutations/useUpdateDoctorWorkScheduleMutation';
import { useGetDoctorWorkScheduleDetailQuery } from '../hooks/queries/useGetDoctorWorkScheduleDetailQuery';
import DoctorInfiniteSelect from './selects/DoctorInfiniteSelect';

type ModifyDoctorWorkScheduleProps = {
  trigger?: ReactElement;
  scheduleId?: number;
  initialValues?: Partial<CreateDoctorWorkSchedulePayload>;
  onSuccess?: (schedule: DoctorWorkSchedule) => void;
};

function timeValueToTotalMinutes(input: unknown): number | null {
  if (!input) return null;

  if (typeof input === 'string') {
    // "HH:mm" hoặc "HH:mm:ss"
    const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(input.trim());
    if (!m) return null;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return hh * 60 + mm;
  }

  // AntD TimePicker thường trả dayjs/moment-like object
  const maybeObj = input as { hour?: () => number; minute?: () => number };
  if (typeof maybeObj.hour === 'function' && typeof maybeObj.minute === 'function') {
    const hh = maybeObj.hour();
    const mm = maybeObj.minute();
    if (typeof hh === 'number' && typeof mm === 'number') return hh * 60 + mm;
  }

  return null;
}

export default function ModifyDoctorWorkSchedule({
  trigger,
  scheduleId,
  initialValues,
  onSuccess,
}: ModifyDoctorWorkScheduleProps) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const createMutation = useCreateDoctorWorkScheduleMutation();
  const updateMutation = useUpdateDoctorWorkScheduleMutation();

  const detailQuery = useGetDoctorWorkScheduleDetailQuery(scheduleId, open);

  const effectiveScheduleId = scheduleId;
  const isEdit = Boolean(effectiveScheduleId);

  const submitting = createMutation.isPending || updateMutation.isPending;

  const resolvedInitial = useMemo(() => {
    const d = detailQuery.data?.data;
    return {
      doctorId: d?.doctorId ?? initialValues?.doctorId ?? undefined,
      workDate: d?.workDate ?? initialValues?.workDate ?? undefined,
      startTime: d?.startTime ?? initialValues?.startTime ?? undefined,
      endTime: d?.endTime ?? initialValues?.endTime ?? undefined,
      maxPatients: d?.maxPatients ?? initialValues?.maxPatients ?? 20,
      slotDurationMinutes: d?.slotDurationMinutes ?? initialValues?.slotDurationMinutes ?? 30,
    };
  }, [detailQuery.data, initialValues]);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      ...resolvedInitial,
      workDate: dayjs(resolvedInitial.workDate),
      startTime: dayjs(resolvedInitial.startTime, DATE_FORMAT.TIME),
      endTime: dayjs(resolvedInitial.endTime, DATE_FORMAT.TIME),
    });
  }, [form, open, resolvedInitial]);

  async function handleFinish(values: CreateDoctorWorkSchedulePayload) {
    try {
      const payloadBase: CreateDoctorWorkSchedulePayload = {
        doctorId: Number(values.doctorId),
        workDate: dayjs(values.workDate).format(DATE_FORMAT.DB_DATE),
        startTime: dayjs(values.startTime).format(DATE_FORMAT.TIME),
        endTime: dayjs(values.endTime).format(DATE_FORMAT.TIME),
        maxPatients: Number(values.maxPatients),
        slotDurationMinutes: Number(values.slotDurationMinutes),
      };

      if (effectiveScheduleId) {
        const payload: UpdateDoctorWorkSchedulePayload = payloadBase;
        const res = await updateMutation.mutateAsync({ scheduleId: effectiveScheduleId, payload });
        message.success(res.message || 'Thành công');
        setOpen(false);
        form.resetFields();
        onSuccess?.(res.data);
        return;
      }

      const res = await createMutation.mutateAsync(payloadBase);
      message.success(res.message || 'Thành công');
      setOpen(false);
      form.resetFields();
      onSuccess?.(res.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Thao tác thất bại';
      message.error(msg);
    }
  }

  const triggerNode = trigger ? (
    cloneElement(trigger, {
      onClick: (e: unknown) => {
        trigger.props?.onClick?.(e);
        setOpen(true);
      },
    })
  ) : (
    <Button type="primary" onClick={() => setOpen(true)}>
      Thêm lịch
    </Button>
  );

  return (
    <>
      {triggerNode}
      <Modal
        open={open}
        title={isEdit ? 'Chỉnh sửa lịch làm việc' : 'Thêm lịch làm việc'}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={submitting}
        destroyOnClose
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            maxPatients: 20,
            slotDurationMinutes: 30,
          }}
        >
          <Row gutter={8}>
            <Col span={24}>
              <Form.Item name="doctorId" label="Bác sĩ" rules={[{ required: true, message: 'Vui lòng chọn bác sĩ' }]}>
                <DoctorInfiniteSelect style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="workDate" label="Ngày" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
                <DatePicker format={DATE_FORMAT.DATE} placeholder="Chọn ngày" className="w-full" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="startTime"
                label="Giờ bắt đầu"
                rules={[{ required: true, message: 'Vui lòng nhập giờ bắt đầu' }]}
              >
                <TimePicker format={DATE_FORMAT.TIME} placeholder="Chọn giờ bắt đầu" className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="Giờ kết thúc"
                dependencies={['startTime']}
                rules={[
                  { required: true, message: 'Vui lòng nhập giờ kết thúc' },
                  ({ getFieldValue }) => ({
                    validator: async (_, value) => {
                      const start = getFieldValue('startTime');
                      const startMin = timeValueToTotalMinutes(start);
                      const endMin = timeValueToTotalMinutes(value);

                      if (startMin == null || endMin == null) return;
                      if (endMin <= startMin) {
                        throw new Error('Giờ kết thúc phải lớn hơn giờ bắt đầu');
                      }
                    },
                  }),
                ]}
              >
                <TimePicker format={DATE_FORMAT.TIME} placeholder="Chọn giờ kết thúc" className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxPatients"
                label="Số bệnh nhân tối đa"
                rules={[{ required: true, message: 'Vui lòng nhập số bệnh nhân tối đa' }]}
              >
                <InputNumber min={1} className="w-full!" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="slotDurationMinutes"
                label="Thời lượng mỗi slot (phút)"
                rules={[{ required: true, message: 'Vui lòng nhập thời lượng slot' }]}
              >
                <InputNumber min={5} className="w-full!" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}
