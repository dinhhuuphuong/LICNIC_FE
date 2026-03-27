import { Button, Form, Input, Modal, Spin, message } from 'antd';
import type { ReactElement } from 'react';
import { cloneElement, useEffect, useState } from 'react';

import { type CreateDoctorPayload, type Doctor, type UpdateDoctorPayload } from '@/services/doctorService';

import MoneyInput from '@/components/common/inputs/money-input';
import NumberFormatInput from '@/components/common/inputs/number-format-input';
import { useCreateDoctorMutation } from '../hooks/mutations/useCreateDoctorMutation';
import { useUpdateDoctorMutation } from '../hooks/mutations/useUpdateDoctorMutation';
import { useGetDoctorDetailQuery } from '../hooks/queries/useGetDoctorDetailQuery';
import UserInfiniteSelect from './selects/UserInfiniteSelect';

type ModifyDoctorProps = {
  trigger?: ReactElement;
  doctorId?: number;
  initialValues?: Partial<CreateDoctorPayload>;
  onSuccess?: (doctor: Doctor) => void;
};

const ModifyDoctor = ({ trigger, doctorId, initialValues, onSuccess }: ModifyDoctorProps) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const createDoctorMutation = useCreateDoctorMutation();
  const updateDoctorMutation = useUpdateDoctorMutation();

  const editDoctorId = (initialValues as unknown as Partial<Doctor> | undefined)?.doctorId;
  const effectiveDoctorId = doctorId ?? editDoctorId;

  const doctorDetailQuery = useGetDoctorDetailQuery(effectiveDoctorId, open);

  useEffect(() => {
    if (!open) return;

    const detail = doctorDetailQuery.data?.data;
    form.setFieldsValue({
      userId: detail?.userId ?? initialValues?.userId ?? undefined,
      specialization: detail?.specialization ?? initialValues?.specialization ?? undefined,
      experienceYears: detail?.experienceYears ?? initialValues?.experienceYears ?? undefined,
      description: detail?.description ?? initialValues?.description ?? undefined,
      consultationFee:
        detail?.consultationFee != null
          ? Number.parseFloat(String(detail.consultationFee))
          : (initialValues?.consultationFee ?? undefined),
    });
  }, [doctorDetailQuery.data, form, initialValues, open]);

  async function handleFinish(values: CreateDoctorPayload) {
    try {
      if (effectiveDoctorId) {
        const payload: UpdateDoctorPayload = {
          specialization: values.specialization,
          experienceYears: values.experienceYears,
          description: values.description,
          consultationFee: values.consultationFee,
        };

        const res = await updateDoctorMutation.mutateAsync({ doctorId: effectiveDoctorId, payload });
        message.success(res.message || 'Thành công');
        setOpen(false);
        form.resetFields();
        onSuccess?.(res.data);
        return;
      }

      const res = await createDoctorMutation.mutateAsync(values);
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
      Thêm bác sĩ
    </Button>
  );

  const submitting = createDoctorMutation.isPending || updateDoctorMutation.isPending;

  return (
    <>
      {triggerNode}
      <Modal
        open={open}
        title={effectiveDoctorId ? 'Chỉnh sửa bác sĩ' : 'Thêm bác sĩ'}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={submitting}
        destroyOnHidden
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Spin spinning={doctorDetailQuery.isLoading}>
          <Form form={form} layout="vertical" onFinish={handleFinish}>
            <Form.Item
              name="userId"
              label="User"
              rules={[{ required: true, message: 'Vui lòng chọn user' }]}
              normalize={(v) => (v == null || v === '' ? v : Number(v))}
            >
              <UserInfiniteSelect disabled={!!effectiveDoctorId} />
            </Form.Item>

            <Form.Item
              name="specialization"
              label="Chuyên khoa"
              rules={[{ required: true, message: 'Vui lòng nhập chuyên khoa' }]}
            >
              <Input placeholder="Nội tổng quát" />
            </Form.Item>

            <Form.Item
              name="experienceYears"
              label="Kinh nghiệm (năm)"
              rules={[{ required: true, message: 'Vui lòng nhập số năm kinh nghiệm' }]}
            >
              <NumberFormatInput type="number" placeholder="5" min={0} className="w-full!" />
            </Form.Item>

            <Form.Item
              name="consultationFee"
              label="Phí tư vấn"
              rules={[{ required: true, message: 'Vui lòng nhập phí tư vấn' }]}
            >
              <MoneyInput placeholder="200.000" min={0} step={1000} />
            </Form.Item>

            <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
              <Input.TextArea placeholder="Bác sĩ có kinh nghiệm..." autoSize={{ minRows: 3, maxRows: 6 }} />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  );
};

export default ModifyDoctor;
