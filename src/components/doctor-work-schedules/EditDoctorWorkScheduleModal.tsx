import { getWorkingRangeByDay } from '@/services/clinicInfoService';
import type { FormInstance } from 'antd';
import { Form, InputNumber, Modal, Spin, TimePicker } from 'antd';
import dayjs from 'dayjs';

type EditDoctorWorkScheduleModalProps = {
  isVi: boolean;
  open: boolean;
  form: FormInstance;
  confirmLoading: boolean;
  detailLoading: boolean;
  workDate?: string | null;
  clinicWorkingHours?: string | null;
  onSubmit: () => void;
  onCancel: () => void;
};

function timeValueToTotalMinutes(input: unknown): number | null {
  if (!input) return null;

  if (typeof input === 'string') {
    const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(input.trim());
    if (!m) return null;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return hh * 60 + mm;
  }

  const maybeObj = input as { hour?: () => number; minute?: () => number };
  if (typeof maybeObj.hour === 'function' && typeof maybeObj.minute === 'function') {
    const hh = maybeObj.hour();
    const mm = maybeObj.minute();
    if (typeof hh === 'number' && typeof mm === 'number') return hh * 60 + mm;
  }

  return null;
}

export function EditDoctorWorkScheduleModal({
  isVi,
  open,
  form,
  confirmLoading,
  detailLoading,
  workDate,
  clinicWorkingHours,
  onSubmit,
  onCancel,
}: EditDoctorWorkScheduleModalProps) {
  return (
    <Modal
      title={isVi ? 'Sửa lịch làm việc' : 'Edit work schedule'}
      open={open}
      okText={isVi ? 'Lưu' : 'Save'}
      cancelText={isVi ? 'Hủy' : 'Cancel'}
      onOk={onSubmit}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
    >
      <Spin spinning={detailLoading}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="startTime"
            label={isVi ? 'Giờ bắt đầu' : 'Start time'}
            rules={[
              { required: true, message: isVi ? 'Vui lòng chọn giờ bắt đầu' : 'Please select start time' },
              {
                validator: async (_, value) => {
                  const dayValue = dayjs(workDate);
                  const selectedTime = timeValueToTotalMinutes(value);
                  if (!dayValue.isValid() || selectedTime == null) return;

                  const range = getWorkingRangeByDay(dayValue.day(), clinicWorkingHours);
                  const rangeStart = timeValueToTotalMinutes(range.start);
                  const rangeEnd = timeValueToTotalMinutes(range.end);
                  if (rangeStart == null || rangeEnd == null) return;

                  if (selectedTime < rangeStart || selectedTime >= rangeEnd) {
                    throw new Error(
                      isVi
                        ? `Giờ bắt đầu phải trong khung ${range.start}-${range.end}.`
                        : `Start time must be within ${range.start}-${range.end}.`,
                    );
                  }
                },
              },
            ]}
          >
            <TimePicker className="w-full" format="HH:mm" />
          </Form.Item>
          <Form.Item
            name="endTime"
            label={isVi ? 'Giờ kết thúc' : 'End time'}
            dependencies={['startTime']}
            rules={[
              { required: true, message: isVi ? 'Vui lòng chọn giờ kết thúc' : 'Please select end time' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startTime = getFieldValue('startTime');
                  if (!value || !startTime) return Promise.resolve();
                  if (!dayjs(value).isAfter(dayjs(startTime))) {
                    return Promise.reject(
                      new Error(isVi ? 'Giờ kết thúc phải lớn hơn giờ bắt đầu' : 'End time must be after start time'),
                    );
                  }

                  const dayValue = dayjs(workDate);
                  const startMin = timeValueToTotalMinutes(startTime);
                  const endMin = timeValueToTotalMinutes(value);
                  if (!dayValue.isValid() || startMin == null || endMin == null) return Promise.resolve();

                  const range = getWorkingRangeByDay(dayValue.day(), clinicWorkingHours);
                  const rangeStart = timeValueToTotalMinutes(range.start);
                  const rangeEnd = timeValueToTotalMinutes(range.end);
                  if (rangeStart == null || rangeEnd == null) return Promise.resolve();

                  if (endMin > rangeEnd || endMin <= rangeStart) {
                    return Promise.reject(
                      new Error(
                        isVi
                          ? `Giờ kết thúc phải trong khung ${range.start}-${range.end}.`
                          : `End time must be within ${range.start}-${range.end}.`,
                      ),
                    );
                  }

                  return Promise.resolve();
                },
              }),
            ]}
          >
            <TimePicker className="w-full" format="HH:mm" />
          </Form.Item>
          <Form.Item
            name="maxPatients"
            label={isVi ? 'Số bệnh nhân tối đa' : 'Max patients'}
            rules={[
              { required: true, message: isVi ? 'Vui lòng nhập số bệnh nhân tối đa' : 'Please enter max patients' },
            ]}
          >
            <InputNumber className="w-full!" min={1} />
          </Form.Item>
          <Form.Item
            name="slotDurationMinutes"
            label={isVi ? 'Thời lượng mỗi lượt (phút)' : 'Slot duration (minutes)'}
            rules={[
              { required: true, message: isVi ? 'Vui lòng nhập thời lượng mỗi lượt' : 'Please enter slot duration' },
            ]}
          >
            <InputNumber className="w-full!" min={5} />
          </Form.Item>
        </Form>
        {detailLoading ? (
          <p className="text-sm text-slate-500">{isVi ? 'Đang tải chi tiết lịch...' : 'Loading schedule details...'}</p>
        ) : null}
      </Spin>
    </Modal>
  );
}
