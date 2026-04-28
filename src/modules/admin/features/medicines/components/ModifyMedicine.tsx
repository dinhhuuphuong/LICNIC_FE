import { Button, Col, Form, Input, InputNumber, Modal, Row, message } from 'antd';
import type { ReactElement } from 'react';
import { cloneElement, useEffect, useState } from 'react';

import { type CreateMedicinePayload, type Medicine, type UpdateMedicinePayload } from '@/services/medicineService';

import { useCreateMedicineMutation } from '../hooks/mutations/useCreateMedicineMutation';
import { useUpdateMedicineMutation } from '../hooks/mutations/useUpdateMedicineMutation';
import { useGetMedicineDetailQuery } from '../hooks/queries/useGetMedicineDetailQuery';

type ModifyMedicineProps = {
  trigger?: ReactElement;
  medicineId?: number;
  initialValues?: Partial<CreateMedicinePayload>;
  onSuccess?: (medicine: Medicine) => void;
};

const ModifyMedicine = ({ trigger, medicineId, initialValues, onSuccess }: ModifyMedicineProps) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const createMedicineMutation = useCreateMedicineMutation();
  const updateMedicineMutation = useUpdateMedicineMutation();

  const editMedicineId = (initialValues as Medicine)?.medicineId as number | undefined;
  const effectiveMedicineId = medicineId ?? editMedicineId;
  const medicineDetailQuery = useGetMedicineDetailQuery(effectiveMedicineId, open);

  useEffect(() => {
    if (!open) return;

    const detail = medicineDetailQuery.data?.data;
    form.setFieldsValue({
      medicineName: detail?.medicineName ?? initialValues?.medicineName ?? undefined,
      activeIngredient: detail?.activeIngredient ?? initialValues?.activeIngredient ?? undefined,
      description: detail?.description ?? initialValues?.description ?? undefined,
      price: detail?.price ?? initialValues?.price ?? undefined,
    });
  }, [medicineDetailQuery.data, form, initialValues, open]);

  async function handleFinish(values: CreateMedicinePayload) {
    try {
      if (effectiveMedicineId) {
        const payload: UpdateMedicinePayload = {
          medicineName: values.medicineName,
          activeIngredient: values.activeIngredient,
          description: values.description,
          price: values.price,
        };
        const res = await updateMedicineMutation.mutateAsync({
          medicineId: effectiveMedicineId,
          payload,
        });
        message.success(res.message || 'Thành công');
        setOpen(false);
        form.resetFields();
        onSuccess?.(res.data);
        return;
      }

      const res = await createMedicineMutation.mutateAsync(values);
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
      Thêm thuốc
    </Button>
  );

  const submitting = createMedicineMutation.isPending || updateMedicineMutation.isPending;

  return (
    <>
      {triggerNode}
      <Modal
        open={open}
        title={effectiveMedicineId ? 'Chỉnh sửa thuốc' : 'Thêm thuốc'}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={submitting}
        destroyOnClose
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="medicineName"
            label="Tên thuốc"
            rules={[{ required: true, message: 'Vui lòng nhập tên thuốc' }]}
          >
            <Input placeholder="Paracetamol 500mg" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="activeIngredient"
                label="Hoạt chất"
                rules={[{ required: true, message: 'Vui lòng nhập hoạt chất' }]}
              >
                <Input placeholder="Paracetamol" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="price"
                label="Giá (VND)"
                rules={[{ required: true, message: 'Vui lòng nhập giá thuốc' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={1000}
                  placeholder="12000"
                  parser={(value) => Number((value ?? '').toString().replace(/[^\d.-]/g, ''))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
            <Input.TextArea placeholder="Giảm đau, hạ sốt" autoSize={{ minRows: 3, maxRows: 5 }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModifyMedicine;
